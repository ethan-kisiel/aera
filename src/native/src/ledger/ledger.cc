#include "ledger.hh"

Ledger::Ledger(std::unique_ptr<LedgerRepository> ledger_repository) :
ledger_repository_(std::move(ledger_repository)) {
}

// Ledger::create_entry()