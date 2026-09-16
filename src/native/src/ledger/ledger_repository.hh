#pragma once
#include <utility>
#include <variant>
#include "../core/database.hh"

class LedgerRepository {
    private:
        std::string db_file_;
        using Storage = decltype(get_storage(""));
        Storage storage_;

    public:
        struct EntrySearchFilter {
            std::optional<std::string> year;
            std::optional<std::pair<int64_t, int64_t>> amount_range;
            std::optional<std::vector<std::string>> check_numbers;
            std::optional<std::vector<std::string>> checkbooks;
            std::optional<std::vector<std::string>> categories;
            std::optional<std::vector<std::string>> subcategories;
            std::optional<std::vector<std::string>> itemizations;
        };

        struct SortConfig {
            std::variant<
            int32_t Entry::*,
            int64_t Entry::*,
            std::string Entry::*> column;
            bool descending;
        };
        
        LedgerRepository(const std::string& db_file = ":memory:");

        std::vector<std::string> get_column_uniques(std::string Entry::* column);
        std::vector<std::string> get_unique_years();

        int64_t get_entries_total(LedgerRepository::EntrySearchFilter search_filter);

        std::optional<Entry> create_entry(Entry& entry);
        std::optional<Entry> get_by_id(const int& id);
        std::optional<std::vector<Entry>> get_all(const std::optional<SortConfig>& sort_config = std::nullopt);
        std::optional<Entry> update_entry(const Entry& entry);
        std::optional<std::vector<Entry>> search(
            const EntrySearchFilter& search_filter,
            const std::optional<SortConfig>& sort_config = std::nullopt
        );
        std::optional<int32_t> delete_entry(const int32_t& id);

        static auto get_where_clause(const LedgerRepository::EntrySearchFilter& search_filter) {
            const std::pair<int64_t, int64_t> dummy_range{0, 0};
            const std::vector<std::string> dummy_strings{""};
            return sqlite_orm::where(
                (!search_filter.year.has_value() or 
                sqlite_orm::like(
                    &Entry::date, "%" + search_filter.year.value_or("bollacks") + "%"
                )) and
                (!search_filter.amount_range.has_value() or
                sqlite_orm::between(
                    &Entry::amount, 
                    search_filter.amount_range.value_or(dummy_range).first,
                    search_filter.amount_range.value_or(dummy_range).second
                )) and
                (!search_filter.check_numbers.has_value() or
                sqlite_orm::in(&Entry::check_number, 
                    search_filter.check_numbers.value_or(dummy_strings)
                )) and
                (!search_filter.checkbooks.has_value() or
                sqlite_orm::in(&Entry::checkbook,
                    search_filter.checkbooks.value_or(dummy_strings)
                )) and
                (!search_filter.categories.has_value() or
                sqlite_orm::in(&Entry::category, 
                    search_filter.categories.value_or(dummy_strings)
                )) and
                (!search_filter.subcategories.has_value() or
                sqlite_orm::in(&Entry::subcategory, 
                    search_filter.subcategories.value_or(dummy_strings)
                )) and
                (!search_filter.itemizations.has_value() or
                sqlite_orm::in(&Entry::itemization, 
                    search_filter.itemizations.value_or(dummy_strings)
                ))
            );
        }
};