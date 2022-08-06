{
    "targets": [
    {
        "target_name": "winscreencap",
        "sources": ["cppsrc/winscreencap.cc"],
    'include_dirs': [
    "<!@(node -p \"require('node-addon-api').include\")"
    ],
    'libraries': [],
    'dependencies': [
        "<!(node -p \"require('node-addon-api').gyp\")"
    ],
    'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ]
    }
    ]
}