#include "WinScreenCapWrapper.h"
#include <iostream>

Napi::Object WinScreenCapWrapper::Init(Napi::Env env, Napi::Object exports) {
    // This method is used to hook the accessor and method callbacks
    Napi::Function func = DefineClass(env, "WinScreenCap", {
        InstanceMethod<&WinScreenCapWrapper::GetScreenCount>("GetScreenCount", static_cast<napi_property_attributes>(napi_writable | napi_configurable)),
        InstanceMethod<&WinScreenCapWrapper::CaptureScreen>("CaptureScreen", static_cast<napi_property_attributes>(napi_writable | napi_configurable)),
        InstanceMethod<&WinScreenCapWrapper::SetValue>("SetValue", static_cast<napi_property_attributes>(napi_writable | napi_configurable))
    });

    Napi::FunctionReference* constructor = new Napi::FunctionReference();

    // Create a persistent reference to the class constructor. This will allow
    // a function called on a class prototype and a function
    // called on instance of a class to be distinguished from each other.
    *constructor = Napi::Persistent(func);
    exports.Set("WinScreenCap", func);

    // Store the constructor as the add-on instance data. This will allow this
    // add-on to support multiple instances of itself running on multiple worker
    // threads, as well as multiple instances of itself running in different
    // contexts on the same thread.
    //
    // By default, the value set on the environment here will be destroyed when
    // the add-on is unloaded using the `delete` operator, but it is also
    // possible to supply a custom deleter.
    env.SetInstanceData<Napi::FunctionReference>(constructor);

    return exports;
}

WinScreenCapWrapper::WinScreenCapWrapper(const Napi::CallbackInfo& info) :
    Napi::ObjectWrap<WinScreenCapWrapper>(info),_b64_converter(1920*1080) {
    Napi::Env env = info.Env();

    // ...
    Napi::Number value = info[0].As<Napi::Number>();
    this->_value = value.DoubleValue();

    std::vector<std::unique_ptr<WinScreenCap::DisplayInfo>> displays = WinScreenCap::WinScreenCap::GetDisplayInfo();
    for (auto& di : displays) {
        _screen_regions.push_back(new WinScreenCap::WinScreenCap(di->x,  di->y, di->width,  di->height));
    }
}

Napi::Value WinScreenCapWrapper::GetScreenCount(const Napi::CallbackInfo& info){
    Napi::Env env = info.Env();
    return Napi::Number::New(env, _screen_regions.size());
}

Napi::Value WinScreenCapWrapper::CaptureScreen(const Napi::CallbackInfo& info){
    Napi::Env env = info.Env();
    Napi::Number value = info[0].As<Napi::Number>();
    int screen_number = value.Int32Value();
    if(screen_number < 0 && screen_number >= _screen_regions.size()) return env.Null();

    auto* screen_capper = _screen_regions[screen_number];
    screen_capper->Capture();
    screen_capper->Compress();
    const char* b64 = _b64_converter.Convert(screen_capper->JpegBuffer(), screen_capper->JpegSize());
    return Napi::String::New(env, b64);
}


Napi::Value WinScreenCapWrapper::SetValue(const Napi::CallbackInfo& info){
    Napi::Env env = info.Env();
    // ...
    Napi::Number value = info[0].As<Napi::Number>();
    this->_value = value.DoubleValue();
    return this->GetScreenCount(info);
}