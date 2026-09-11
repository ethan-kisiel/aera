#pragma once
#include "ledger_repository.hh"

class Ledger {
    public:
        Ledger(std::unique_ptr<LedgerRepository> ledger_repository);
        // std::set<std::string> get_check_numbers() const;
        // std::set<std::string> get_checkbooks() const;
        // std::set<std::string> get_categories() const;
        // std::set<std::string> get_subcategories() const;
        // std::set<std::string> get_itemizations() const;

        //crud
        std::optional<Entry> create_entry(Entry entry);
        std::optional<Entry> get_by_id(int id);
        std::optional<std::vector<Entry>> get_all(std::optional<LedgerRepository::SortConfig> sort_config = std::nullopt);
        std::optional<Entry> update_entry(Entry entry);
        std::optional<std::vector<Entry>> search(
            LedgerRepository::EntrySearchFilter search_filter,
            std::optional<LedgerRepository::SortConfig> sort_config = std::nullopt
        );
    
    private:
        std::unique_ptr<LedgerRepository> ledger_repository_;
        
        // std::set<std::string> check_numbers_;
        // std::set<std::string> checkbooks_;
        // std::set<std::string> categories_;
        // std::set<std::string> subcategories_;
        // std::set<std::string> itemizations_;
};