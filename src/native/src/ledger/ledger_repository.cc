#include "ledger_repository.hh"
#include "database.hh"


LedgerRepository::LedgerRepository(const std::string& db_file) : db_file_(db_file), storage_(get_storage(db_file)) 
{
    try {
        storage_.sync_schema();
    } catch (...) {
    }
}

std::optional<Entry> LedgerRepository::create_entry(Entry entry) {
    try {
        auto result = this->storage_.insert(entry);
        entry.id = result;
        return entry;
    }
    catch (...) {
        return std::nullopt;
    }
}

std::optional<Entry> LedgerRepository::get_by_id(int id) {
    try {
        auto storage = get_storage(this->db_file_);
        auto entry = storage.get<Entry>(id);
        return entry;
    } catch (...) {
        return std::nullopt;
    }
}

std::optional<std::vector<Entry>> LedgerRepository::get_all(
    std::optional<SortConfig> sort_config) {
        try {
            auto storage = get_storage(this->db_file_);
            if (!sort_config.has_value()) {
                return storage.get_all<Entry>();
            }
            auto order_by = sort_config->descending ? 
                sqlite_orm::order_by(sort_config->column).desc() :
                sqlite_orm::order_by(sort_config->column).asc();
            return storage.get_all<Entry>(order_by);
        } catch (...) {
            return std::nullopt;
        }
}

std::optional<Entry> LedgerRepository::update_entry(Entry entry) {
    try {
        auto storage = get_storage(this->db_file_);
        storage.update(entry);
        return entry;
    } catch (...) {
        return std::nullopt;
    }
}

std::optional<std::vector<Entry>> LedgerRepository::search(
    EntrySearchFilter search_filter,
    std::optional<SortConfig> sort_config
) {
    try {
    auto storage = get_storage(this->db_file_);
    auto where_clause = sqlite_orm::where(
        (!search_filter.year.has_value() or 
        sqlite_orm::like(
            &Entry::date, search_filter.year.value()
        )) and
        (!search_filter.amount_range.has_value() or
        sqlite_orm::between(
            &Entry::amount, search_filter.amount_range->first,
            search_filter.amount_range->second
        )) and
        (!search_filter.check_numbers.has_value() or
        sqlite_orm::in(&Entry::check_number, 
            search_filter.check_numbers.value()
        )) and
        (!search_filter.checkbooks.has_value() or
        sqlite_orm::in(&Entry::checkbook, 
            search_filter.checkbooks.value()
        )) and
        (!search_filter.categories.has_value() or
        sqlite_orm::in(&Entry::category, 
            search_filter.categories.value()
        )) and
        (!search_filter.subcategories.has_value() or
        sqlite_orm::in(&Entry::subcategory, 
            search_filter.subcategories.value()
        )) and
        (!search_filter.itemizations.has_value() or
        sqlite_orm::in(&Entry::itemization, 
            search_filter.itemizations.value()
        ))
    );
        if (!sort_config.has_value()) {
            return storage.get_all<Entry>(where_clause);
        }

        auto order_by = sort_config->descending ? 
            sqlite_orm::order_by(sort_config->column).desc() :
            sqlite_orm::order_by(sort_config->column).asc();
        return storage.get_all<Entry>(where_clause, order_by);
    } catch (...) {
        return std::nullopt;
    }
    return std::nullopt;
}