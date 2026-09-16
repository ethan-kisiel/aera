#include "ledger.hh"
#include "entry.hh"
#include <iostream>

Ledger::Ledger(std::unique_ptr<LedgerRepository> ledger_repository) :
ledger_repository_(std::move(ledger_repository)) {
}

std::vector<std::string> Ledger::get_column_uniques(std::string Entry::* column) {
    try {
        return this->ledger_repository_->get_column_uniques(column);
    } catch (...) {
    }
    return std::vector<std::string> {};
}

std::vector<std::string> Ledger::get_unique_years() {
    try {
        return this->ledger_repository_->get_unique_years();
    } catch (...) {

    }
    return std::vector<std::string> {};
}


int64_t Ledger::get_entries_total(LedgerRepository::EntrySearchFilter search_filter) {
    try {
        return this->ledger_repository_->get_entries_total(search_filter);
    } catch (...) {
    }
    return 0l;
}


std::optional<Entry> Ledger::create_entry(Entry& entry) {
    try {
        return this->ledger_repository_->create_entry(entry);
    } catch (...) {
    }
    return std::nullopt;
}

std::optional<Entry> Ledger::get_by_id(const int32_t& id) {
    try {
        return this->ledger_repository_->get_by_id(id);
    } catch (...) {
    }
    return std::nullopt;
}

std::vector<Entry> Ledger::get_all(const std::optional<LedgerRepository::SortConfig>& sort_config) {
    try {
        auto entries = this->ledger_repository_->get_all(sort_config);

        if (entries.has_value()) {
            return entries.value();
        }
    } catch (...) {
    }
    return std::vector<Entry>();
};

std::optional<Entry> Ledger::update_entry(const Entry& entry) {
    try {
        return this->ledger_repository_->update_entry(entry);
    } catch (...) {
    }
    return std::nullopt;
}

std::vector<Entry> Ledger::search(
    const LedgerRepository::EntrySearchFilter& search_filter,
    const std::optional<LedgerRepository::SortConfig>& sort_config
) {
    try {
        auto entries = this->ledger_repository_->search(search_filter, sort_config);
        if (entries.has_value()) {
            return entries.value();
        }
    }
    catch (...) {
    }
    return std::vector<Entry>();
}

std::optional<int32_t> Ledger::delete_entry(const int32_t& id) {
    try {
        return this->ledger_repository_->delete_entry(id);
    } catch (...) {
    }
    return std::nullopt;
}
