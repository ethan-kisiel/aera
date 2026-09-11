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
        InstanceMethod("createEntry", &LedgerAddon::CreateEntry)
      });
    }

  private:
    std::optional<Entry> parse_entry(const Napi::Object& input_object) {      
      Napi::Value id_value,
      amount_value,
      date_value,
      check_number_value,
      checkbook_value,
      category_value,
      subcategory_value,
      itemization_value,
      notes_value;

      if (!input_object.Has("id") ||
      !input_object.Has("amount")||
      !input_object.Has("date") ||
      !input_object.Has("check_number") ||
      !input_object.Has("checkbook") ||
      !input_object.Has("category") ||
      !input_object.Has("subcategory") ||
      !input_object.Has("itemization") ||
      !input_object.Has("notes")) {
        return std::nullopt;
      }

      id_value = input_object.Get("id");
      amount_value = input_object.Get("amount");
      date_value = input_object.Get("date");
      check_number_value = input_object.Get("check_number");
      checkbook_value = input_object.Get("checkbook");
      category_value = input_object.Get("category");
      subcategory_value = input_object.Get("subcategory");
      itemization_value = input_object.Get("itemization");
      notes_value = input_object.Get("notes");

      if (!id_value.IsNumber() ||
      !amount_value.IsNumber() ||
      !date_value.IsString() ||
      !check_number_value.IsString() ||
      !checkbook_value.IsString() ||
      !category_value.IsString() ||
      !subcategory_value.IsString() ||
      !itemization_value.IsString() ||
      !notes_value.IsString()) {
          return std::nullopt;
      }

      return Entry {
        id_value.As<Napi::Number>().Int32Value(),
        amount_value.As<Napi::Number>().Int64Value(),
        check_number_value.As<Napi::String>().Utf8Value(),
        checkbook_value.As<Napi::String>().Utf8Value(),
        category_value.As<Napi::String>().Utf8Value(),
        subcategory_value.As<Napi::String>().Utf8Value(),
        itemization_value.As<Napi::String>().Utf8Value(),
        notes_value.As<Napi::String>().Utf8Value(),
      };
    }

    Napi::Object get_entry_object(const Entry& entry, const Napi::Env& env) {
      Napi::Object entry_object = Napi::Object::New(env);
      entry_object.Set(Napi::String::New(env, "id"), entry.id);
      entry_object.Set(Napi::String::New(env, "amount"), entry.amount);
      entry_object.Set(Napi::String::New(env, "check_number"), entry.check_number);
      entry_object.Set(Napi::String::New(env, "checkbook"), entry.checkbook);
      entry_object.Set(Napi::String::New(env, "category"), entry.category);
      entry_object.Set(Napi::String::New(env, "subcategory"), entry.subcategory);
      entry_object.Set(Napi::String::New(env, "itemization"), entry.itemization);
      entry_object.Set(Napi::String::New(env, "notes"), entry.notes);

      return entry_object;
    }

    Napi::Value CreateEntry(const Napi::CallbackInfo& info) {
      Napi::Env env = info.Env();
      Napi::Object input_object = info[0].As<Napi::Object>();
      std::optional<Entry> entry = parse_entry(input_object);

      if (!entry.has_value()) {
        Napi::TypeError::New(env, 
            "Invalid Entry object")
            .ThrowAsJavaScriptException();
        return env.Null();
      }

      entry = this->ledger_->create_entry(entry.value());

      if (!entry.has_value()) {
        Napi::TypeError::New(env, 
            "Database entry failed")
            .ThrowAsJavaScriptException();
        return env.Null();
      }

      return get_entry_object(entry.value(), env);
    }

    Napi::Value Status(const Napi::CallbackInfo& info) {
      Napi::Env env = info.Env();
      Napi::Object input_object = info[0].As<Napi::Object>();

      if (!input_object.Has("name")) {
        return Napi::String::New(info.Env(), "Status: NULL");
      }
      
      return Napi::String::New(info.Env(), "Status: " + input_object.Get("name").As<Napi::String>().Utf8Value());
    }

    std::unique_ptr<Ledger> ledger_ = std::make_unique<Ledger>(std::make_unique<LedgerRepository>());
};

// NODE_API_MODULE(native_addon, Init)
NODE_API_ADDON(LedgerAddon)