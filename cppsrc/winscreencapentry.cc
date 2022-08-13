#include <napi.h>

#include "winscreencapwrapper.h"

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  WinScreenCapWrapper::Init(env, exports);
  return exports;
}

NODE_API_MODULE(testaddon, InitAll)