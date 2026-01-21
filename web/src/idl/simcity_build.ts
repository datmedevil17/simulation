/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/simcity_build.json`.
 */
export type SimcityBuild = {
  "address": "6U4BoX8jTdsJca3N6B1H42x4NkCeMVV667QkDBV8bdKq",
  "metadata": {
    "name": "simcityBuild",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "bulldoze",
      "docs": [
        "Clear a tile"
      ],
      "discriminator": [
        56,
        145,
        179,
        49,
        2,
        105,
        63,
        157
      ],
      "accounts": [
        {
          "name": "city",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "city.authority",
                "account": "city"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "sessionToken",
          "optional": true
        }
      ],
      "args": [
        {
          "name": "x",
          "type": "u8"
        },
        {
          "name": "y",
          "type": "u8"
        }
      ]
    },
    {
      "name": "commit",
      "discriminator": [
        223,
        140,
        142,
        165,
        229,
        208,
        156,
        74
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "city",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "delegate",
      "discriminator": [
        90,
        147,
        75,
        178,
        85,
        88,
        4,
        137
      ],
      "accounts": [
        {
          "name": "payer",
          "signer": true
        },
        {
          "name": "bufferPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "pda"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                81,
                56,
                184,
                27,
                177,
                230,
                90,
                208,
                1,
                212,
                144,
                148,
                130,
                179,
                116,
                171,
                38,
                237,
                193,
                235,
                21,
                209,
                104,
                194,
                47,
                84,
                146,
                205,
                153,
                181,
                157,
                20
              ]
            }
          }
        },
        {
          "name": "delegationRecordPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "pda"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "delegationMetadataPda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "pda"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "pda",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "ownerProgram",
          "address": "6U4BoX8jTdsJca3N6B1H42x4NkCeMVV667QkDBV8bdKq"
        },
        {
          "name": "delegationProgram",
          "address": "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeCity",
      "docs": [
        "Initialize a new city account"
      ],
      "discriminator": [
        197,
        90,
        209,
        212,
        126,
        67,
        110,
        204
      ],
      "accounts": [
        {
          "name": "city",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "placeBuilding",
      "docs": [
        "Place a building on the grid"
      ],
      "discriminator": [
        75,
        157,
        111,
        168,
        31,
        210,
        104,
        227
      ],
      "accounts": [
        {
          "name": "city",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "city.authority",
                "account": "city"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "sessionToken",
          "optional": true
        }
      ],
      "args": [
        {
          "name": "x",
          "type": "u8"
        },
        {
          "name": "y",
          "type": "u8"
        },
        {
          "name": "buildingType",
          "type": "u8"
        }
      ]
    },
    {
      "name": "processUndelegation",
      "discriminator": [
        196,
        28,
        41,
        206,
        48,
        37,
        51,
        167
      ],
      "accounts": [
        {
          "name": "baseAccount",
          "writable": true
        },
        {
          "name": "buffer"
        },
        {
          "name": "payer",
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "accountSeeds",
          "type": {
            "vec": "bytes"
          }
        }
      ]
    },
    {
      "name": "stepSimulation",
      "docs": [
        "Simulate one step (can be called periodically)"
      ],
      "discriminator": [
        141,
        169,
        41,
        73,
        27,
        155,
        171,
        111
      ],
      "accounts": [
        {
          "name": "city",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "city.authority",
                "account": "city"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "sessionToken",
          "optional": true
        }
      ],
      "args": []
    },
    {
      "name": "undelegate",
      "discriminator": [
        131,
        148,
        180,
        198,
        91,
        104,
        42,
        238
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "city",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "payer"
              }
            ]
          }
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "city",
      "discriminator": [
        3,
        204,
        223,
        157,
        129,
        30,
        45,
        230
      ]
    },
    {
      "name": "sessionToken",
      "discriminator": [
        233,
        4,
        115,
        14,
        46,
        21,
        1,
        15
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "outOfBounds",
      "msg": "Coordinates out of bounds"
    },
    {
      "code": 6001,
      "name": "invalidBuildingType",
      "msg": "Invalid building type"
    },
    {
      "code": 6002,
      "name": "invalidAuth",
      "msg": "Invalid authentication"
    },
    {
      "code": 6003,
      "name": "notEnoughMoney",
      "msg": "Not enough money"
    }
  ],
  "types": [
    {
      "name": "city",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tiles",
            "type": {
              "array": [
                {
                  "array": [
                    "u8",
                    16
                  ]
                },
                16
              ]
            }
          },
          {
            "name": "population",
            "type": "u32"
          },
          {
            "name": "money",
            "type": "u64"
          },
          {
            "name": "lastUpdated",
            "type": "i64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "sessionToken",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "targetProgram",
            "type": "pubkey"
          },
          {
            "name": "sessionSigner",
            "type": "pubkey"
          },
          {
            "name": "validUntil",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
