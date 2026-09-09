#pragma once

#include <sqlite3.h>
#include <string>
#include <vector>
#include <mutex>
#include "ledger/entry.hpp"

class SqliteDriver {
    private: 
        std::mutex db_mutex;
        std::mutex stmt_mutex;

        sqlite3* db = nullptr;
        sqlite3_stmt* stmt = nullptr;
        int rc;

        int migrate();

    public:
        struct EntryFilters {
            std::string start_date;
            std::string end_date;

            std::string check_numbers;
            std::string checkbooks;
            std::string categories;
            std::string subcategories;
            std::string itemizations;
        };

        SqliteDriver(std::string db_file);
        int add_entry(Entry &entry);
        int update_entry(Entry &entry);
        int delete_entry(uint entry_id);
        int get_all_entries(std::vector<Entry> &entries, EntryFilters &filters);
        int search(std::string search_query, std::vector<Entry> &entries, EntryFilters& filters);
        int get_entry_by_id(uint entry_id, Entry *entry);
};