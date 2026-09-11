#include "ledger.hh"
#include "entry.hh"
#include <iostream>

Ledger::Ledger(std::unique_ptr<LedgerRepository> ledger_repository) :
ledger_repository_(std::move(ledger_repository)) {
}

std::optional<Entry> Ledger::create_entry(Entry entry) {
    try {
        return this->ledger_repository_->create_entry(entry);
    } catch (...) {
    }
    return std::nullopt;
}