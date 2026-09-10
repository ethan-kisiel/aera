#include <napi.h>
#include "src/ledger/ledger.hh"

Napi::String GetGreeting(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, "Hello from the C++ Backend!");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "getGreeting"), Napi::Function::New(env, GetGreeting));
  return exports;
}

class LedgerAddon : public Napi::Addon<LedgerAddon> {
  public:
    LedgerAddon(Napi::Env env, Napi::Object exports) {
      DefineAddon(exports, {
        InstanceMethod("status", &LedgerAddon::Status),
      });
    }

  private:
    Napi::Value Status(const Napi::CallbackInfo& info) {
      return Napi::String::New(info.Env(), "Status: NULL");
    }

    std::unique_ptr<Ledger> ledger_ = std::make_unique<Ledger>();
};

// NODE_API_MODULE(native_addon, Init)
NODE_API_ADDON(LedgerAddon)