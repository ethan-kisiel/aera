#include "ledger.hh"
#include "entry.hh"
#include <iostream>

Ledger::Ledger(std::unique_ptr<LedgerRepository> ledger_repository) :
ledger_repository_(std::move(ledger_repository)) {
}

std::optional<Entry> Ledger::create_entry(const Entry& entry) {
    try {
        return this->ledger_repository_->create_entry(entry);
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