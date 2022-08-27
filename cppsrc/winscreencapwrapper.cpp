#include "WinScreenCapWrapper.h"
#include <iostream>

Napi::Object WinScreenCapWrapper::Init(Napi::Env env, Napi::Object exports) {
    // This method is used to hook the accessor and method callbacks
    Napi::Function func = DefineClass(env, "WinScreenCap", {
        InstanceMethod<&WinScreenCapWrapper::GetScreenInfo>("GetScreenInfo", static_cast<napi_property_attributes>(napi_writable | napi_configurable)),
        InstanceMethod<&WinScreenCapWrapper::GetScreenCount>("GetScreenCount", static_cast<napi_property_attributes>(napi_writable | napi_configurable)),
        InstanceMethod<&WinScreenCapWrapper::CaptureScreen>("CaptureScreen", static_cast<napi_property_attributes>(napi_writable | napi_configurable))
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


    //Gather the list of displays and positions
    std::vector<std::unique_ptr<WinScreenCap::DisplayInfo>> displays = WinScreenCap::WinScreenCap::GetDisplayInfo();
    for (auto& di : displays) {
        _screen_regions.push_back(new WinScreenCap::WinScreenCap(di->x,  di->y, di->width,  di->height));
        _screen_comparators.push_back(new WinScreenCap::ImageComparator(di->width, di->height, 10, 10));
    }
}

Napi::Value WinScreenCapWrapper::GetScreenInfo(const Napi::CallbackInfo& info){
    Napi::Env env = info.Env();

    Napi::Array screen_list = Napi::Array::New(info.Env(), _screen_regions.size());
    int idx = 0;
    for(auto& screen : _screen_regions){
        Napi::Object screen_info = Napi::Object::New(info.Env());
        screen_info.Set("x", screen->Left());
        screen_info.Set("y", screen->Top());
        screen_info.Set("width", screen->Width());
        screen_info.Set("height", screen->Height());
        screen_list[idx++] = screen_info;

    }

    return screen_list;
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
    auto* screen_comparator = _screen_comparators[screen_number];
    screen_capper->Capture(screen_comparator->CurrentBuffer());
    int difference_count = screen_comparator->GenerateDifferenceRegions();
    screen_comparator->Swap();
    Napi::Array change_regions = Napi::Array::New(info.Env(), difference_count);
    int idx = 0;
    for(int r=0; r<difference_count; r++){
        Napi::Object screen_info = Napi::Object::New(info.Env());
        auto* region = screen_comparator->Region(r);
        screen_info.Set("x", region->X);
        screen_info.Set("y", region->Y);
        screen_info.Set("width", 192);//FORNOW
        screen_info.Set("height", 108);
        screen_info.Set("image",std::string(reinterpret_cast<const char*>(_b64_converter.Convert(region->Buffer.get(), region->ImageSize))));
        change_regions[idx++] = screen_info;
    }
    return change_regions;
}