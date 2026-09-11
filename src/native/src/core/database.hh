#pragma once
#include <sqlite_orm/sqlite_orm.h>
#include "../ledger/entry.hh"
#include <string>

inline auto get_storage(const std::string db_path) {
    using namespace sqlite_orm;
    auto storage = make_storage(db_path, 
        make_table("entries",
        make_column("id", &Entry::id, primary_key().autoincrement()),
        make_column("date", &Entry::date),
        make_column("check_number", &Entry::check_number),
        make_column("checkbook", &Entry::checkbook),
        make_column("category", &Entry::category),
        make_column("subcategory", &Entry::subcategory),
        make_column("itemization", &Entry::itemization),
        make_column("notes", &Entry::notes)
        )
    );

    storage.busy_timeout(5000);

    storage.pragma.journal_mode(journal_mode::WAL);

    return storage;
}