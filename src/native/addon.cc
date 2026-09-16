#include <napi.h>
#include "src/ledger/ledger.hh"

class LedgerAddon : public Napi::Addon<LedgerAddon> {
  public:
    LedgerAddon(Napi::Env env, Napi::Object exports) {
      DefineAddon(exports, {
        InstanceMethod("getColumnUniques", &LedgerAddon::GetColumnUniques),
        InstanceMethod("getUniqueYears", &LedgerAddon::GetUniqueYears),
        InstanceMethod("getEntriesTotal", &LedgerAddon::GetEntriesTotal),
        InstanceMethod("createEntry", &LedgerAddon::CreateEntry),
        InstanceMethod("getById", &LedgerAddon::GetById),
        InstanceMethod("getAll", &LedgerAddon::GetAll),
        InstanceMethod("updateEntry", &LedgerAddon::UpdateEntry),
        InstanceMethod("search", &LedgerAddon::Search),
      });
    }

  private:
    std::optional<std::vector<std::string>> napi_string_array_to_vector(const Napi::Array& array) {
      uint32_t length = array.Length();
      std::vector<std::string> vector;
      vector.reserve(length);

      for (uint32_t i = 0; i < length; i++) {
        Napi::Value element = array[i];
        if (element.IsNumber()) {
          vector.push_back(element.As<Napi::String>().Utf8Value());
        }
      }

      if (vector.size() > 0) {
        return vector;
      }
      return std::nullopt;
    }

    LedgerRepository::EntrySearchFilter parse_entry_search_filter(const Napi::Object& input_object) {
      Napi::Value current_filter;
      
      LedgerRepository::EntrySearchFilter search_filter {
      };

      if (input_object.Has("year")) {
        current_filter = input_object.Get("year");
        if (current_filter.IsString())
        {
          search_filter.year = current_filter.As<Napi::String>().Utf8Value();
        }
      }

      if (input_object.Has("amount_range")) {
        current_filter = input_object.Get("amount_range");
        if (current_filter.IsArray()) {
          Napi::Array amount_range = current_filter.As<Napi::Array>();
          if (amount_range.Length() == 2) {
            Napi::Value first, second;
            first = amount_range[0u];
            second = amount_range[1u];
            if (first.IsNumber() && second.IsNumber()) {
              search_filter.amount_range = 
                std::pair<int64_t, int64_t> {
                  first.As<Napi::Number>().Int64Value(),
                  second.As<Napi::Number>().Int64Value(),
                };
            }
          }
        }
      }

      if (input_object.Has("check_numbers")) {
        current_filter = input_object.Get("check_numbers");
        if (current_filter.IsArray()) {
          search_filter.check_numbers = napi_string_array_to_vector(
            current_filter.As<Napi::Array>()
          );
        }
      }

      if (input_object.Has("checkbooks")) {
        current_filter = input_object.Get("checkbooks");
        if (current_filter.IsArray()) {
          search_filter.check_numbers = napi_string_array_to_vector(
            current_filter.As<Napi::Array>()
          );
        }
      }

      if (input_object.Has("categories")) {
        current_filter = input_object.Get("categories");
        if (current_filter.IsArray()) {
          search_filter.check_numbers = napi_string_array_to_vector(
            current_filter.As<Napi::Array>()
          );
        }
      }

      if (input_object.Has("subcategories")) {
        current_filter = input_object.Get("subcategories");
        if (current_filter.IsArray()) {
          search_filter.check_numbers = napi_string_array_to_vector(
            current_filter.As<Napi::Array>()
          );
        }
      }

      if (input_object.Has("itemizations")) {
        current_filter = input_object.Get("itemizations");
        if (current_filter.IsArray()) {
          search_filter.check_numbers = napi_string_array_to_vector(
            current_filter.As<Napi::Array>()
          );
        }
      }

      return search_filter;
    }

    std::optional<LedgerRepository::SortConfig> parse_sort_config(const Napi::Object& input_object) {
      if (input_object.IsNull()) {
        return std::nullopt;
      }
      Napi::Value column_value, descending_value;
      if (!input_object.Has("column") || !input_object.Has("descending")) {
        return std::nullopt;
      }
      column_value = input_object.Get("column");
      descending_value = input_object.Get("descending");

      if (!column_value.IsString() || !descending_value.IsBoolean()) {
        return std::nullopt;
      }
      auto column_string = column_value.As<Napi::String>().Utf8Value();
      auto descending = descending_value.As<Napi::Boolean>();
      if (column_string == "id") {
        return LedgerRepository::SortConfig {
          &Entry::id,
          descending
        };
      }
      if (column_string == "amount") {
        return LedgerRepository::SortConfig {
          &Entry::amount,
          descending
        };
      }
      if (column_string == "date") {
        return LedgerRepository::SortConfig {
          &Entry::date,
          descending
        };
      }
      if (column_string == "check_number") {
        return LedgerRepository::SortConfig {
          &Entry::check_number,
          descending
        };
      }
      if (column_string == "checkbook") {
        return LedgerRepository::SortConfig {
          &Entry::checkbook,
          descending
        };
      }
      if (column_string == "category") {
        return LedgerRepository::SortConfig {
          &Entry::category,
          descending
        };
      }
      if (column_string == "subcategory") {
        return LedgerRepository::SortConfig {
          &Entry::subcategory,
          descending
        };
      }
      if (column_string == "itemization") {
        return LedgerRepository::SortConfig {
          &Entry::itemization,
          descending
        };
      }
      if (column_string == "notes") {
        return LedgerRepository::SortConfig {
          &Entry::notes,
          descending
        };
      }
    }

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
        date_value.As<Napi::String>().Utf8Value(),
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
      entry_object.Set(Napi::String::New(env, "date"), entry.date);
      entry_object.Set(Napi::String::New(env, "check_number"), entry.check_number);
      entry_object.Set(Napi::String::New(env, "checkbook"), entry.checkbook);
      entry_object.Set(Napi::String::New(env, "category"), entry.category);
      entry_object.Set(Napi::String::New(env, "subcategory"), entry.subcategory);
      entry_object.Set(Napi::String::New(env, "itemization"), entry.itemization);
      entry_object.Set(Napi::String::New(env, "notes"), entry.notes);

      return entry_object;
    }

    Napi::Value GetColumnUniques(const Napi::CallbackInfo& info) {
      Napi::Env env = info.Env();
      Napi::Value column_value = info[0];

      if (!column_value.IsString()) {
        return env.Null();
      }
      auto column_string = column_value.As<Napi::String>().Utf8Value();
      if (column_string == "checkbook") {
        auto values = this->ledger_->get_column_uniques(&Entry::checkbook);
        Napi::Array result = Napi::Array::New(env, values.size());
        for (int i = 0; i < values.size(); ++i) {
          result[i] = Napi::String::New(env, values[i]);
        }
        return result;
      }
      if (column_string == "category") {
        auto values = this->ledger_->get_column_uniques(&Entry::category);
        Napi::Array result = Napi::Array::New(env, values.size());
        for (int i = 0; i < values.size(); ++i) {
          result[i] = Napi::String::New(env, values[i]);
        }
        return result;
      }
      if (column_string == "subcategory") {
        auto values = this->ledger_->get_column_uniques(&Entry::subcategory);
        Napi::Array result = Napi::Array::New(env, values.size());
        for (int i = 0; i < values.size(); ++i) {
          result[i] = Napi::String::New(env, values[i]);
        }
        return result;
      }
      if (column_string == "itemization") {
        auto values = this->ledger_->get_column_uniques(&Entry::itemization);
        Napi::Array result = Napi::Array::New(env, values.size());
        for (int i = 0; i < values.size(); ++i) {
          result[i] = Napi::String::New(env, values[i]);
        }
        return result;
      }
      return env.Null();
    }

    Napi::Value GetUniqueYears(const Napi::CallbackInfo& info) {
      Napi::Env env = info.Env();
      auto values = this->ledger_->get_unique_years();
      Napi::Array result = Napi::Array::New(env, values.size());
      for (int i = 0; i < values.size(); ++i) {
        result[i] = Napi::String::New(env, values[i]);
      }
      return result;
    }

    Napi::Value GetEntriesTotal(const Napi::CallbackInfo& info) {
      Napi::Env env = info.Env();
      Napi::Object filter_object = info[0].As<Napi::Object>();

      auto total = this->ledger_->get_entries_total(this->parse_entry_search_filter(filter_object));
    
      return Napi::Number::New(env, total);
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

    Napi::Value GetById(const Napi::CallbackInfo& info) {
      Napi::Env env = info.Env();
      Napi::Value input_id_value = info[0].As<Napi::Value>();
      if (!input_id_value.IsNumber()) {
        Napi::TypeError::New(env, 
          "Invalid input, id must be string")
          .ThrowAsJavaScriptException();
        return env.Null();
      }
      auto entry = this->ledger_->get_by_id(input_id_value.As<Napi::Number>().Int32Value());
      if (entry.has_value()) {
        return get_entry_object(entry.value(), env);
      }
      return env.Null();
    }

    Napi::Value GetAll(const Napi::CallbackInfo& info) {
      Napi::Env env = info.Env();
      std::optional<LedgerRepository::SortConfig> sort_config;
      if (info[0].IsObject() && !info[0].IsNull()) {
        Napi::Object input_object = info[0].As<Napi::Object>();
        sort_config = this->parse_sort_config(input_object);
      }
      auto entries = this->ledger_->get_all(sort_config);
      Napi::Array result = Napi::Array::New(env, entries.size());
      for (int i = 0; i < entries.size(); ++i) {
        result[i] = this->get_entry_object(entries[i], env);
      }
      return result;
    }

    Napi::Value UpdateEntry(const Napi::CallbackInfo& info) {
      Napi::Env env = info.Env();
      Napi::Object input_object = info[0].As<Napi::Object>();
      std::optional<Entry> entry = parse_entry(input_object);

      if (!entry.has_value()) {
        Napi::TypeError::New(env, 
            "Invalid Entry object")
            .ThrowAsJavaScriptException();
        return env.Null();
      }

      entry = this->ledger_->update_entry(entry.value());

      if (!entry.has_value()) {
        Napi::TypeError::New(env, 
            "Database entry failed")
            .ThrowAsJavaScriptException();
        return env.Null();
      }

      return get_entry_object(entry.value(), env);
    }

    Napi::Value Search(const Napi::CallbackInfo& info) {
      Napi::Env env = info.Env();
      std::optional<LedgerRepository::SortConfig> sort_config;
      Napi::Object filter_object = info[0].As<Napi::Object>();

      if (info[1].IsObject() && !info[1].IsNull()) {
        Napi::Object input_object = info[1].As<Napi::Object>();
        sort_config = this->parse_sort_config(input_object);
      }
      auto entries = this->ledger_->search(this->parse_entry_search_filter(filter_object), sort_config);
      
      Napi::Array result = Napi::Array::New(env, entries.size());
      for (int i = 0; i < entries.size(); ++i) {
        result[i] = this->get_entry_object(entries[i], env);
      }
      return result;
    }

    std::unique_ptr<Ledger> ledger_ = std::make_unique<Ledger>(std::make_unique<LedgerRepository>());
};

// NODE_API_MODULE(native_addon, Init)
NODE_API_ADDON(LedgerAddon)