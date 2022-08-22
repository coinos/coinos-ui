#!/usr/bin/python

import argparse, json, logging

DEFAULT_FROM_LOCALE = 'en'

def nested_dict_keys(d, _keyname_prefix=''):
    entry_list = []
    for key in d:
        value = d[key]
        if isinstance(value, dict):
            entry_list += nested_dict_keys(value, _keyname_prefix + key + '.')
        else:
            entry_list += [_keyname_prefix + key]
    return entry_list

def localize_string(string_id, from_data, to_data):
    logging.debug("Translating string with id %s", string_id)
    id_parts = string_id.split('.')

    # get original string
    to_translate = from_data
    for id_part in id_parts:
        to_translate = to_translate[id_part]

    # get translated string
    print("Please translate the following text (id " + string_id + "):")
    print(to_translate)

    translated = input("Type the translated text then press ENTER: ")

    # find/create place to put translated string
    translation_location = to_data  # the dictionary or list that should contain the translated string
    for id_part in id_parts[:-1]:
        if id_part not in translation_location:
            translation_location[id_part] = {}
        translation_location = translation_location[id_part]

    translation_location[id_parts[-1]] = translated

if __name__ == "__main__":
    # setup and parse commandline arguments
    args_parser = argparse.ArgumentParser(description="guided translation of CoinOS")
    args_parser.add_argument('from_locale', nargs='?', type=str,
                        help='which locale to translate from')
    args_parser.add_argument('to_locale', nargs='?', type=str,
                        help='which locale to translate to')
    args = args_parser.parse_args()

    from_locale = args.from_locale or input("Which locale do you want to translate from (default: %s)? "
                                            % DEFAULT_FROM_LOCALE) or DEFAULT_FROM_LOCALE
    to_locale = args.to_locale or input("Which locale do you want to translate to? ")
    if not to_locale:
        raise ValueError("You need to specify a language to translate to.")

    logging.basicConfig(format='%(levelname)s: %(message)s')

    # load locale files
    logging.debug("Reading file to convert from (%s.json)", from_locale)
    with open(from_locale + ".json", 'r') as from_file:
        from_json_text = from_file.read()
    logging.debug("Converting from data from JSON to object")
    from_data = json.loads(from_json_text)
    from_id_list = nested_dict_keys(from_data)
    logging.info("Successfully obtained %d strings from locale %s",
                 len(from_id_list), from_locale)
    logging.debug("List of strings: %s", from_id_list)

    logging.debug("Reading file to convert to (%s.json)", to_locale)
    with open(to_locale + ".json", 'r') as to_file:
        to_json_text = to_file.read()
    logging.debug("Converting to data from JSON to object")
    to_data = json.loads(to_json_text)
    to_id_list = nested_dict_keys(to_data)
    logging.info("Successfully obtained %d strings from locale %s",
                 len(to_id_list), to_locale)
    logging.debug("List of strings: %s", to_id_list)

    # localize strings!
    try:
        for string_id in from_id_list:
            if string_id not in to_id_list:
                localize_string(string_id, from_data, to_data)
                to_id_list.append(string_id)
    except KeyboardInterrupt:
        print("Program interrupted.  Saving strings and closing program...")

    # save localized data
    with open(to_locale + ".json", 'w') as to_file:
        json.dump(to_data, to_file, ensure_ascii=False, indent=2)
    logging.info("Saved %d localized strings to %s.json", len(to_id_list), to_locale)
