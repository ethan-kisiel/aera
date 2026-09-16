#pragma once
#include "ledger_repository.hh"

class Ledger {
    public:
        Ledger(std::unique_ptr<LedgerRepository> ledger_repository);

        std::vector<std::string> get_column_uniques(std::string Entry::* column);
        std::vector<std::string> get_unique_years();

        int64_t get_entries_total(LedgerRepository::EntrySearchFilter search_filter);

        std::optional<Entry> create_entry(Entry& entry);
        std::optional<Entry> get_by_id(const int32_t& id);
        std::vector<Entry> get_all(const std::optional<LedgerRepository::SortConfig>& sort_config = std::nullopt);
        std::optional<Entry> update_entry(const Entry& entry);
        std::vector<Entry> search(
            const LedgerRepository::EntrySearchFilter& search_filter,
            const std::optional<LedgerRepository::SortConfig>& sort_config = std::nullopt
        );
        std::optional<int32_t> delete_entry(const int32_t& id);
    
    private:
        std::unique_ptr<LedgerRepository> ledger_repository_;
};