#include <napi.h>

Napi::String GetGreeting(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, "Hello from the C++ Backend!");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "getGreeting"), Napi::Function::New(env, GetGreeting));
  return exports;
}

NODE_API_MODULE(native_addon, Init)