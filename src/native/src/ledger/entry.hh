#pragma once

#include <string>

struct Entry {
    int id;
    long amount;
    int date;
    std::optional<std::string> check_number;
    std::string checkbook;
    std::string category;
    std::string subcategory;
    std::string itemization;
    std::string notes;
};