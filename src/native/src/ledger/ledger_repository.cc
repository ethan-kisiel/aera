#include "ledger_repository.hh"
#include "database.hh"


LedgerRepository::LedgerRepository(const std::string& db_file) : db_file_(db_file), storage_(get_storage(db_file)) 
{
    try {
        storage_.sync_schema();
    } catch (...) {
    }
}

std::optional<Entry> LedgerRepository::create_entry(Entry& entry) {
    try {
        auto result = this->storage_.insert(entry);
        entry.id = result;
        return entry;
    }
    catch (...) {
        return std::nullopt;
    }
}

std::optional<Entry> LedgerRepository::get_by_id(const int& id) {
    try {
        auto entry = this->storage_.get<Entry>(id);
        return entry;
    } catch (...) {
        return std::nullopt;
    }
}

std::optional<std::vector<Entry>> LedgerRepository::get_all(
    const std::optional<SortConfig>& sort_config) {
        try {
            if (!sort_config.has_value()) {
                return this->storage_.get_all<Entry>();
            }
            return std::visit([&](auto column_ptr) -> std::vector<Entry> {
                if (sort_config->descending) {
                    return this->storage_.get_all<Entry>(
                        sqlite_orm::order_by(column_ptr).desc()
                    );
                } else {
                    return this->storage_.get_all<Entry>(
                        sqlite_orm::order_by(column_ptr).asc()
                    );
                }
            }, sort_config->column);
        } catch (...) {
            return std::nullopt;
        }
}

std::optional<Entry> LedgerRepository::update_entry(const Entry& entry) {
    try {
        this->storage_.update(entry);
        return entry;
    } catch (...) {
        return std::nullopt;
    }
}

std::optional<std::vector<Entry>> LedgerRepository::search(
    const EntrySearchFilter& search_filter,
    const std::optional<SortConfig>& sort_config
) {
    try {
        if (!sort_config.has_value()) {
            return this->storage_.get_all<Entry>();
        }
        
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

        return std::visit([&](auto column_ptr) -> std::vector<Entry> {
            if (sort_config->descending) {
                return storage_.get_all<Entry>(
                    where_clause,
                    sqlite_orm::order_by(column_ptr).desc()
                );
            } else {
                return storage_.get_all<Entry>(
                    where_clause,
                    sqlite_orm::order_by(column_ptr).asc()
                );
            }
        }, sort_config->column);
    } catch (...) {
        return std::nullopt;
    }
    return std::nullopt;
}