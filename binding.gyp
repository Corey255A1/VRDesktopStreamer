{
    "targets": [
        {
            "target_name": "winscreencap",
            "sources": [
                "cppsrc/winscreencapentry.cc",
                "cppsrc/winscreencapwrapper.cpp"
                ],
            "include_dirs": [
                "<!@(node -p \"require('node-addon-api').include\")",
                "<(module_root_dir)/cppsrc/winscreencaplib/"
            ],
            "libraries": [
                "<(module_root_dir)/cppsrc/winscreencaplib/WinScreenCap.lib"
            ],
            "dependencies": [
            "<!(node -p \"require('node-addon-api').gyp\")",
            ],
            'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ]
        }
    ]
}