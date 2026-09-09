#pragma once

#include <sqlite_orm/sqlite_orm.h>
#include "ledger/entry.h"
#include <string>



inline auto get_storage(const std::string& db_path) {
    using namespace sqlite_orm;
    auto storage = make_storage(":memory:", 
        make_table("entries",
        make_column("id", &Entry::id, primary_key().autoincrement())
        )
    );

    storage.busy_timeout(5000);
    storage.pragma.journal_mode(journal_mode::WAL);

    return storage;
}