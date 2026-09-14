#include "ledger_repository.hh"
#include "database.hh"
#include <iostream>


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

        auto where_clause = get_where_clause(search_filter);
        
        if (!sort_config.has_value()) {
            return this->storage_.get_all<Entry>(where_clause);
        }

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
    } 
    catch (std::system_error &e) {
        std::cout << "sql error: " << e.what() << '\n';
    }
    catch (...) {
        return std::nullopt;
    }
    return std::nullopt;
}
