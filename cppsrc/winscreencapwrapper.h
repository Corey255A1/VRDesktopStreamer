#include <napi.h>
#include "WinScreenCap.h"
#include "Base64Converter.h"
#include <vector>
class WinScreenCapWrapper : public Napi::ObjectWrap<WinScreenCapWrapper> {
  public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    WinScreenCapWrapper(const Napi::CallbackInfo& info);

  private:
    std::vector<WinScreenCap::WinScreenCap*> _screen_regions;
    Utils::Base64Converter _b64_converter;
    Napi::Value GetScreenInfo(const Napi::CallbackInfo& info);
    Napi::Value GetScreenCount(const Napi::CallbackInfo& info);
    Napi::Value CaptureScreen(const Napi::CallbackInfo& info);
};