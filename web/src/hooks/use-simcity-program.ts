import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN, setProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { type SimcityBuild } from "../idl/simcity_build";
import IDL from "../idl/simcity_build.json";
import { useSessionKeyManager } from "@magicblock-labs/gum-react-sdk";

// SimCity account data structure matches IDL Key
export interface CityAccount {
    tiles: number[][]; // [[u8; 16]; 16]
    population: number; // u32
    money: BN; // u64
    lastUpdated: BN; // i64
    authority: PublicKey;
}

// Ephemeral Rollup endpoints - configurable via environment
const ER_ENDPOINT = "https://devnet.magicblock.app";
const ER_WS_ENDPOINT = "wss://devnet.magicblock.app";

// Delegation status
export type DelegationStatus = "undelegated" | "delegated" | "checking";

/**
 * Hook to interact with the SimCity program on Solana.
 * Provides real-time updates via WebSocket subscriptions.
 * Supports MagicBlock Ephemeral Rollups for delegation, commit, and undelegation.
 */
export function useSimCityProgram() {
    const { connection } = useConnection();
    const wallet = useWallet();

    const [cityPubkey, setCityPubkeyState] = useState<PublicKey | null>(() => {
        return null;
    });

    const [cityAccount, setCityAccount] = useState<CityAccount | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDelegating, setIsDelegating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [delegationStatus, setDelegationStatus] = useState<DelegationStatus>("checking");
    const [erCityAccount, setErCityAccount] = useState<CityAccount | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [successTx, setSuccessTx] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    const showSuccess = useCallback((msg: string, tx: string | null = null) => {
        console.log("showSuccess triggered:", msg, tx);
        setInfoMessage(null); // Clear info
        setSuccessMessage(msg);
        setSuccessTx(tx);
        setTimeout(() => {
            setSuccessMessage(null);
            setSuccessTx(null);
        }, 5000);
    }, []);

    const showInfo = useCallback((msg: string) => {
        setSuccessMessage(null); // Clear success if any (rare)
        setInfoMessage(msg);
    }, []);

    // Base layer Anchor provider and program
    const program = useMemo(() => {
        if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
            return null;
        }

        const provider = new AnchorProvider(
            connection,
            {
                publicKey: wallet.publicKey,
                signTransaction: wallet.signTransaction,
                signAllTransactions: wallet.signAllTransactions,
            },
            { commitment: "confirmed" }
        );

        setProvider(provider);

        return new Program<SimcityBuild>(IDL as SimcityBuild, provider);
    }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

    // Ephemeral Rollup connection and provider
    const erConnection = useMemo(() => {
        return new Connection(ER_ENDPOINT, {
            wsEndpoint: ER_WS_ENDPOINT,
            commitment: "confirmed",
        });
    }, []);

    const erProvider = useMemo(() => {
        if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
            return null;
        }

        return new AnchorProvider(
            erConnection,
            {
                publicKey: wallet.publicKey,
                signTransaction: wallet.signTransaction,
                signAllTransactions: wallet.signAllTransactions,
            },
            { commitment: "confirmed" }
        );
    }, [erConnection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions]);

    const erProgram = useMemo(() => {
        if (!erProvider) {
            return null;
        }

        return new Program<SimcityBuild>(IDL as SimcityBuild, erProvider);
    }, [erProvider]);

    // Session Key Manager
    const sessionWallet = useSessionKeyManager(
        wallet as any,
        connection,
        "devnet"
    );

    const { sessionToken, createSession: sdkCreateSession, isLoading: isSessionLoading } = sessionWallet;

    const createSession = useCallback(async (): Promise<string> => {
        showInfo("Creating Session...");
        await sdkCreateSession(new PublicKey(IDL.address));
        showSuccess("Session Created!");
        return "Session Created";
    }, [sdkCreateSession, showSuccess, showInfo]);

    // Derive PDA from wallet public key
    const derivePDA = useCallback((authority: PublicKey) => {
        const [pda] = PublicKey.findProgramAddressSync(
            [authority.toBuffer()],
            new PublicKey(IDL.address)
        );
        return pda;
    }, []);

    // Auto-derive city PDA when wallet connects
    useEffect(() => {
        if (wallet.publicKey) {
            const pda = derivePDA(wallet.publicKey);
            setCityPubkeyState(pda);
        } else {
            setCityPubkeyState(null);
        }
    }, [wallet.publicKey, derivePDA]);

    // Fetch city account data from base layer
    const fetchCityAccount = useCallback(async () => {
        if (!program || !cityPubkey) {
            setCityAccount(null);
            return;
        }

        try {
            const account = await program.account.city.fetch(cityPubkey);
            setCityAccount({
                tiles: account.tiles as number[][],
                population: account.population,
                money: account.money,
                lastUpdated: account.lastUpdated,
                authority: account.authority,
            });
            setError(null);
        } catch (err) {
            console.debug("City account not found (this is normal for new wallets):", err);
            setCityAccount(null);
            if (err instanceof Error && !err.message.includes("Account does not exist") && !err.message.includes("could not find account")) {
                setError(err.message);
            }
        }
    }, [program, cityPubkey]);

    // Delegation Program address
    const DELEGATION_PROGRAM_ID = new PublicKey("DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh");

    // Check if account is delegated
    const checkDelegationStatus = useCallback(async () => {
        if (!cityPubkey) {
            setDelegationStatus("checking");
            return;
        }

        try {
            setDelegationStatus("checking");

            const accountInfo = await connection.getAccountInfo(cityPubkey);

            if (!accountInfo) {
                setDelegationStatus("undelegated");
                topErCityAccount(null);
                return;
            }

            const isDelegated = accountInfo.owner.equals(DELEGATION_PROGRAM_ID);

            if (isDelegated) {
                setDelegationStatus("delegated");
                if (erProgram) {
                    try {
                        const account = await erProgram.account.city.fetch(cityPubkey);
                        setErCityAccount({
                            tiles: account.tiles as number[][],
                            population: account.population,
                            money: account.money,
                            lastUpdated: account.lastUpdated,
                            authority: account.authority,
                        });
                    } catch {
                        console.debug("Couldn't fetch city from ER");
                    }
                }
            } else {
                setDelegationStatus("undelegated");
                setErCityAccount(null);
            }
        } catch (err) {
            console.debug("Error checking delegation status:", err);
            setDelegationStatus("undelegated");
            setErCityAccount(null);
        }
    }, [cityPubkey, connection, erProgram]);

    // Helper to set ER city account safely
    const topErCityAccount = (val: CityAccount | null) => {
        setErCityAccount(val);
    };

    // Subscribe to base layer account changes
    useEffect(() => {
        if (!program || !cityPubkey) {
            return;
        }

        fetchCityAccount();
        checkDelegationStatus();

        const subscriptionId = connection.onAccountChange(
            cityPubkey,
            async (accountInfo) => {
                try {
                    const decoded = program.coder.accounts.decode("city", accountInfo.data);
                    setCityAccount({
                        tiles: decoded.tiles,
                        population: decoded.population,
                        money: decoded.money,
                        lastUpdated: decoded.lastUpdated,
                        authority: decoded.authority,
                    });
                    setError(null);
                    checkDelegationStatus();
                } catch (err) {
                    console.error("Failed to decode account data:", err);
                }
            },
            "confirmed"
        );

        return () => {
            connection.removeAccountChangeListener(subscriptionId);
        };
    }, [program, cityPubkey, connection, fetchCityAccount, checkDelegationStatus]);

    // Subscribe to ER account changes
    useEffect(() => {
        if (!erProgram || !cityPubkey || delegationStatus !== "delegated") {
            return;
        }

        const subscriptionId = erConnection.onAccountChange(
            cityPubkey,
            async (accountInfo) => {
                try {
                    const decoded = erProgram.coder.accounts.decode("city", accountInfo.data);
                    setErCityAccount({
                        tiles: decoded.tiles,
                        population: decoded.population,
                        money: decoded.money,
                        lastUpdated: decoded.lastUpdated,
                        authority: decoded.authority,
                    });
                } catch (err) {
                    console.error("Failed to decode ER account data:", err);
                }
            },
            "confirmed"
        );

        return () => {
            erConnection.removeAccountChangeListener(subscriptionId);
        };
    }, [erProgram, cityPubkey, erConnection, delegationStatus]);

    // Initialize City
    const initializeCity = useCallback(async (): Promise<string> => {
        if (!program || !wallet.publicKey) {
            throw new Error("Wallet not connected");
        }

        setIsLoading(true);
        setError(null);
        showInfo("Please sign transaction...");

        try {
            const tx = await program.methods
                .initializeCity()
                .accounts({
                    authority: wallet.publicKey,
                })
                .rpc();

            await fetchCityAccount();
            showSuccess("City Initialized!", tx);
            return tx;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to initialize city";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program, wallet.publicKey, fetchCityAccount, showSuccess]);

    const performErAction = useCallback(async (
        methodBuilder: any,
        actionName: string,
        accounts: any,
        forceMainWallet: boolean = false
    ): Promise<string> => {
        setIsLoading(true);
        setError(null);
        if (!program || !erProvider || !wallet.publicKey || !cityPubkey) {
            throw new Error("City not initialized or not delegated");
        }

        try {
            const hasSession = !forceMainWallet && sessionToken != null && sessionWallet != null;
            
            // Robustly extract the actual wallet adapter from the session manager/wallet object
            // Some SDK versions return { sessionWallet: adapter, ... } and others return the adapter directly
            const actualSessionWallet = (sessionWallet as any)?.sessionWallet || sessionWallet;
            const canSignSession = hasSession && actualSessionWallet && typeof actualSessionWallet.signTransaction === 'function';

            const signer = hasSession ? actualSessionWallet.publicKey : wallet.publicKey;

            console.log(`[performErAction] ${actionName}:`, {
                hasSession,
                sessionToken: sessionToken?.toString(),
                sessionWalletKeys: sessionWallet ? Object.keys(sessionWallet) : 'null',
                innerWallet: (sessionWallet as any)?.sessionWallet ? 'exists' : 'missing',
                forceMainWallet,
                signer: signer?.toString()
            });

            // Add common accounts if not present
            const fullAccounts = {
                ...accounts,
                city: cityPubkey,
                signer: signer,
                sessionToken: hasSession ? sessionToken : null,
            };

            let tx = await methodBuilder
                .accounts(fullAccounts)
                .transaction();

            tx.feePayer = wallet.publicKey;
            tx.recentBlockhash = (await erConnection.getLatestBlockhash()).blockhash;

            if (canSignSession) {
                console.log(`[performErAction] Signing with SESSION WALLET`);
                showInfo("Signing with Session Key...");
                tx.feePayer = actualSessionWallet.publicKey; 
                tx = await actualSessionWallet.signTransaction(tx);
            } else {
                console.log(`[performErAction] Signing with MAIN WALLET (will prompt)`);
                showInfo("Please sign transaction in wallet...");
                tx = await erProvider.wallet.signTransaction(tx);
            }

            const txHash = await erConnection.sendRawTransaction(tx.serialize(), {
                skipPreflight: true,
            });
            await erConnection.confirmTransaction(txHash, "confirmed");

            // Refresh ER state
            if (erProgram) {
                try {
                    const account = await erProgram.account.city.fetch(cityPubkey);
                    setErCityAccount({
                        tiles: account.tiles as number[][],
                        population: account.population,
                        money: account.money,
                        lastUpdated: account.lastUpdated,
                        authority: account.authority,
                    });
                } catch { }
            }

            return txHash;
        } catch (err) {
            const message = err instanceof Error ? err.message : `Failed to ${actionName} on ER`;
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
            // Info cleared by showSuccess (which is called by caller) or manually?
            // If caller fails, info stays? No, we should clear it or let success/error handle it.
            // But we don't have clearInfo exposed. showSuccess handles it.
        }
    }, [program, erProvider, erConnection, erProgram, wallet.publicKey, cityPubkey, sessionToken, sessionWallet, showInfo]);

    // Place Building
    // Place Building
    const placeBuilding = useCallback(async (x: number, y: number, buildingType: number): Promise<string> => {
        if (!program || !wallet.publicKey || !cityPubkey) {
            throw new Error("City not initialized");
        }

        // If delegated, send to ER
        if (delegationStatus === "delegated") {
             setError(null);
             return performErAction(
                program.methods.placeBuilding(x, y, buildingType),
                "placeBuilding",
                {}
            ).then(tx => {
                showSuccess("Building placed successfully!", tx);
                return tx;
            });
        }

        setIsLoading(true);
        setError(null);
        showInfo("Please sign transaction...");

        try {
            const tx = await program.methods
                .placeBuilding(x, y, buildingType)
                .accounts({
                    city: cityPubkey,
                    signer: wallet.publicKey,
                    sessionToken: null,
                } as any)
                .rpc();

            showSuccess("Building placed successfully!", tx);
            return tx;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to place building";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program, wallet.publicKey, cityPubkey, delegationStatus, performErAction, showSuccess, showInfo]);

    // Bulldoze
    const bulldoze = useCallback(async (x: number, y: number): Promise<string> => {
        if (!program || !wallet.publicKey || !cityPubkey) {
            throw new Error("City not initialized");
        }

        if (delegationStatus === "delegated") {
             setError(null);
             return performErAction(
                program.methods.bulldoze(x, y),
                "bulldoze",
                {}
            ).then(tx => {
                showSuccess("Bulldozed successfully!", tx);
                return tx;
            });
        }

        setIsLoading(true);
        setError(null);
        showInfo("Please sign transaction...");

        try {
            const tx = await program.methods
                .bulldoze(x, y)
                .accounts({
                    city: cityPubkey,
                    signer: wallet.publicKey,
                    sessionToken: null,
                } as any)
                .rpc();

            showSuccess("Bulldozed successfully!", tx);
            return tx;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to bulldoze";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program, wallet.publicKey, cityPubkey, delegationStatus, performErAction, showSuccess, showInfo]);


    // Delegate
    const delegate = useCallback(async (): Promise<string> => {
        if (!program || !wallet.publicKey || !cityPubkey) {
            throw new Error("Wallet not connected");
        }

        setIsLoading(true);
        setIsDelegating(true);
        setError(null);
        showInfo("Signing delegation...");

        try {
            const tx = await program.methods
                .delegate()
                .accountsPartial({
                    payer: wallet.publicKey,
                    pda: cityPubkey
                })
                .rpc({
                    skipPreflight: true,
                });

            await new Promise(resolve => setTimeout(resolve, 2000));
            await checkDelegationStatus();
            showSuccess("Delegated successfully!", tx);
            return tx;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delegate";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
            setIsDelegating(false);
        }
    }, [program, wallet.publicKey, cityPubkey, checkDelegationStatus, showSuccess]);

    // Commit
    const commit = useCallback(async (): Promise<string> => {
        return performErAction(
            program!.methods.commit(),
            "commit",
            {
                payer: wallet!.publicKey
            },
            true // forceMainWallet
        ).then(async (tx) => {
             // Try to get commitment signature
             try {
                const { GetCommitmentSignature } = await import("@magicblock-labs/ephemeral-rollups-sdk");
                const txCommitSgn = await GetCommitmentSignature(tx, erConnection);
                console.log("Commit signature:", txCommitSgn);
             } catch {}
             await fetchCityAccount();
             showSuccess("Committed to chain!", tx);
             return tx;
        });
    }, [program, wallet, performErAction, erConnection, fetchCityAccount, showSuccess]);

    // Undelegate
    const undelegate = useCallback(async (): Promise<string> => {
        if (!program || !cityPubkey) throw new Error("Not ready");
        
        // Undelegate runs on ER but targets base layer logic via magicblock
        // The implementation in lib.rs "undelegate" expects:
        // payer, city (pda), magic_program, magic_context
        
        return performErAction(
            program.methods.undelegate(),
            "undelegate",
            {
                 payer: wallet!.publicKey
                 // city is added by performErAction
            },
            true // forceMainWallet
        ).then(async (tx) => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setDelegationStatus("undelegated");
            setErCityAccount(null);
            await fetchCityAccount();
            showSuccess("Undelegated!", tx);
            return tx;
        });
    }, [program, wallet, cityPubkey, performErAction, fetchCityAccount, showSuccess]);

    return {
        program,
        cityAccount,
        cityPubkey,
        isLoading,
        isDelegating,
        error,
        successMessage,
        successTx,
        infoMessage,
        // Methods
        initializeCity,
        placeBuilding,
        bulldoze,
        // ER
        delegate,
        commit,
        undelegate,
        // Status
        delegationStatus,
        erCityAccount,
        checkDelegation: checkDelegationStatus,
        // Session
        createSession,
        sessionToken,
        isSessionLoading
    };
}
