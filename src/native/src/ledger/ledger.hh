#pragma once
#include "ledger_repository.hh"

class Ledger {
    public:
        Ledger(std::unique_ptr<LedgerRepository> ledger_repository);
        // std::set<std::string> get_checkbooks() const;
        // std::set<std::string> get_categories() const;
        // std::set<std::string> get_subcategories() const;
        // std::set<std::string> get_itemizations() const;

        std::optional<Entry> create_entry(Entry& entry);
        std::optional<Entry> get_by_id(const int32_t& id);
        std::vector<Entry> get_all(const std::optional<LedgerRepository::SortConfig>& sort_config = std::nullopt);
        std::optional<Entry> update_entry(const Entry& entry);
        std::vector<Entry> search(
            const LedgerRepository::EntrySearchFilter& search_filter,
            const std::optional<LedgerRepository::SortConfig>& sort_config = std::nullopt
        );
    
    private:
        std::unique_ptr<LedgerRepository> ledger_repository_;
};