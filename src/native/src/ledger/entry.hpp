#pragma once

#include <string>

#ifndef uint
#define uint unsigned int
#endif


class Entry {
    private:
        int id;
        uint amount;
        std::string date;
        std::string check_number;
        std::string checkbook;
        std::string category;
        std::string subcategory;
        std::string itemization;
        std::string notes;

    public:
        uint get_amount();
        std::string get_check_number();
        std::string get_checkbook();
        std::string get_category();
        std::string get_subcategory();
        std::string get_itemization();
        std::string get_notes();

        void set_amount(uint amount);
        void set_check_number(std::string check_number);
        void set_checkbook(std::string checkbook);
        void set_category(std::string category);
        void set_subcategory(std::string subcategory);
        void set_itemization(std::string itemization);
        void set_notes(std::string notes);

        Entry::Entry(uint amount,
        std::string date,
        std::string check_number,
        std::string checkbook,
        std::string category,
        std::string subcategory,
        std::string itemization,
        std::string notes);
};