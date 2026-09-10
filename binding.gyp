{
  "targets": [
    {
      "target_name": "native_addon",
      "sources": [ 
        "src/native/main.cc",
        "<!@(node -p \"require('fs').readdirSync('src/native/src/core').filter(f => f.endsWith('.cc') || f.endsWith('.cpp')).map(f => 'src/native/src/core/' + f).join(' ')\")",
        "<!@(node -p \"require('fs').readdirSync('src/native/src/ledger').filter(f => f.endsWith('.cc') || f.endsWith('.cpp')).map(f => 'src/native/src/ledger/' + f).join(' ')\")"
      ],
      "include_dirs": [
        "src/native",
        "src/native/include",
        "src/native/src/core",
        "src/native/src/ledger",
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except"
      ],
      "cflags!": [ "-fno-rtti", "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-rtti", "-fno-exceptions" ],
      "cflags_cc": [ "-frtti", "-fexceptions", "-std=c++20" ],
      "conditions": [
        ["OS=='mac'", {
          "xcode_settings": {
            "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
            "GCC_ENABLE_CPP_RTTI": "YES",
            "CLANG_CXX_LIBRARY": "libc++",
            "MACOSX_DEPLOYMENT_TARGET": "10.15"
          }
        }],
        ["OS=='win'", {
          "msvs_settings": {
            "VCCLCompilerTool": {
              "ExceptionHandling": 1
            }
          }
        }]
      ]
    }
  ]
}