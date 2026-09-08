{
  "targets": [
    {
      "target_name": "native_addon",
      "sources": [ "src/native/main.cpp" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').targets\"):node_addon_api_except"
      ],
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "conditions": [
        ["OS=='mac'", {
          "xcode_settings": { "GCC_ENABLE_CPP_EXCEPTIONS": "YES" }
        }]
      ]
    }
  ]
}