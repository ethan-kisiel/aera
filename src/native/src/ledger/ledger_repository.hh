#pragma once
#include <utility>
#include "../core/database.hh"

class LedgerRepository {
    private:
        std::string db_file_;
        using Storage = decltype(get_storage(""));
        Storage storage_;

    public:
        struct EntrySearchFilter {
            std::optional<std::string> year;
            std::optional<std::pair<long, long>> amount_range;
            std::optional<std::vector<std::string>> check_numbers;
            std::optional<std::vector<std::string>> checkbooks;
            std::optional<std::vector<std::string>> categories;
            std::optional<std::vector<std::string>> subcategories;
            std::optional<std::vector<std::string>> itemizations;
        };
        struct SortConfig {
            int Entry::*column;
            bool descending;
        };
        
        LedgerRepository(const std::string& db_file = ":memory:");

        std::optional<Entry> create_entry(Entry entry);
        std::optional<Entry> get_by_id(int id);
        std::optional<std::vector<Entry>> get_all(std::optional<SortConfig> sort_config = std::nullopt);
        std::optional<Entry> update_entry(Entry entry);
        std::optional<std::vector<Entry>> search(
            EntrySearchFilter search_filter,
            std::optional<SortConfig> sort_config = std::nullopt
        );
};