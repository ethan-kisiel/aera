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

std::vector<std::string> LedgerRepository::get_column_uniques(std::string Entry::* column) {
    try {
        return this->storage_.select(sqlite_orm::distinct(column), sqlite_orm::order_by(column).asc());
    } catch (...) {

    }

    return std::vector<std::string> {};
}

std::vector<std::string> LedgerRepository::get_unique_years() {
    try {
        std::vector<std::string> unique_years {};

        auto dates = this->storage_.select(
            sqlite_orm::distinct(&Entry::date),
            sqlite_orm::order_by(&Entry::date).asc()
        );

        for (auto& date : dates) {
            auto year_string = std::string{std::string_view(date).substr(0, 4)};
            if (
                unique_years.empty() || 
                std::stoi(year_string) >
                std::stoi(unique_years[unique_years.size() - 1])
            ) {
                unique_years.push_back(year_string);
            }
        }

        return unique_years;
    } catch (...) {
        
    }

    return std::vector<std::string> {};
}

int64_t LedgerRepository::get_entries_total(LedgerRepository::EntrySearchFilter search_filter) {
    try {
        auto amount_result = this->storage_.select(
            sqlite_orm::sum(&Entry::amount),
            get_where_clause(search_filter)
        );

        if (!amount_result.empty() && amount_result[0]) {
            return *amount_result[0];
        }
    } catch (...) {
    }

    return 0l;
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


std::optional<int32_t> LedgerRepository::delete_entry(const int32_t& id) {
    try {
        this->storage_.remove<Entry>(id);

        if (this->storage_.changes() > 0) {
            return id;
        } else {
            return std::nullopt;
        }
    } catch (...) {

    }

    return std::nullopt;
}
