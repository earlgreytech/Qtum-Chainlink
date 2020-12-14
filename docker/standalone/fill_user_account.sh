#import private keys and then prefund them
qtum-cli -rpcuser=qtum -rpcpassword=testpasswd importprivkey "cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk" # addr=qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW hdkeypath=m/88'/0'/1'
qtum-cli -rpcuser=qtum -rpcpassword=testpasswd importprivkey "cRcG1jizfBzHxfwu68aMjhy78CpnzD9gJYZ5ggDbzfYD3EQfGUDZ" # addr=qLn9vqbr2Gx3TsVR9QyTVB5mrMoh4x43Uf hdkeypath=m/88'/0'/2'
qtum-cli -rpcuser=qtum -rpcpassword=testpasswd generatetoaddress 1000 qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW
qtum-cli -rpcuser=qtum -rpcpassword=testpasswd generatetoaddress 1000 qLn9vqbr2Gx3TsVR9QyTVB5mrMoh4x43Uf