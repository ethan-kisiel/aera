#pragma once

#include <string>

struct Entry {
    int id;
    uint32_t amount;
    std::string date;
    std::string check_number;
    std::string checkbook;
    std::string category;
    std::string subcategory;
    std::string itemization;
    std::string notes;
};