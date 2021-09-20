const https = require('https')
const parser = require('fast-html-parser')
const { StringDecoder } = require('string_decoder')

const host = `dustloop.com`
const char_path = (character) => {return `/wiki/index.php?title=GGST/${character}/Frame_Data`;}

class DUSTLOOP {
    CHAR_NAMES = {
        "Sol_Badguy":["sol"],
        "Ky_Kiske":["ky"],
        "May":[],
        "Nagoriyuki":["nago"],
        "Faust":[],
        "I-No": ["ino"],
        "Leo_Whitefang":["leo"],
        "Goldlewis_Dickinson":["goldlewis", "gl"],
        "Giovanna":["gio"],
        "Potemkin":["pot"],
        "Jack-O":["jacko"],
        "Chipp_Zanuff":["chipp"],
        "Millia_Rage":["millia"],
        "Zato-1":["zato"],
        "Anji_Mito":["anji"],
        "Axl_Low":["axl"],
        "Ramlethal_Valentine": ["ram"],
        "Slayer":[],
        "Baiken":[],
        "Sin_Kiske":[],
        "Jam_Kuradoberi":[]
    }
    
    TABLE_NAMES = ["system","Normal Moves","Special Moves","Supers","Other"]
    DEFAULT_MOVE_FIELDS = ['name', 'input', 'guard', 'damage', 'startup', 'active', 'recovery', 'onblock']
    DEFAULT_SYSTEM_FIELDS = ['defense','guts', 'prejump', 'backdash', 'weight']
    MOVE_ID_FIELDS = ['name', 'input']
}

DUSTLOOP.prototype.get_complete_character_name = function (name) {
    const lc_name = name.toLowerCase();
    for(var [full_name, alias_arr] of Object.entries(this.CHAR_NAMES)){
        if(lc_name === full_name.toLowerCase()){
            return full_name;
        }
        for(var alias of alias_arr){
            if(lc_name === alias)
                return full_name;
        }
    }

    return null;
}

DUSTLOOP.prototype.get_system_data = function (character, stat_name) {
    return new Promise((resolve, reject) => {
        const name = this.get_complete_character_name(character);
        if(!name){
            reject('No character found with that name');
        } 
        this.get_raw(name)
        .then((raw_data) => {
            let data = this.parse_response(raw_data);
            if(stat_name && data.system[stat_name]){
                var result_string = `${name} -\n${stat_name}: ${data.system[stat_name]}`;
                var cleansed_string = result_string.replace(new RegExp(/\*/, 'g'),'x');
                resolve(cleansed_string);
            } else {
                const field_strings = this.collect_fields(this.DEFAULT_SYSTEM_FIELDS, data.system);
                var cleansed_string = field_strings.replace(new RegExp(/\*/, 'g'),'x');
                resolve(`${name} -\n${cleansed_string}`);
            }
        })
        .catch(err => reject(err));
    })
}

DUSTLOOP.prototype.get_move_data = function(character, move, detail = null) {
    return new Promise((resolve, reject) => {
        const name = this.get_complete_character_name(character);
        if(!name){
            reject('No character found with that name');
        } 
        this.get_raw(name)
        .then((raw_data) => {
            let data = this.parse_response(raw_data);
            let found_move = this.move_with_matching_name(data, move);

            if(!found_move){
                reject(`Could not find a move for ${name} with the name ${move}`);
            }

            if(detail && found_move[detail]){
                const result_string = `${name} [${move}] -\n${detail}: ${found_move[detail]}`
                var cleansed_string = result_string.replace(new RegExp(/\*/, 'g'),'x');
                resolve(cleansed_string);
            } else {
                const field_strings = this.collect_fields(this.DEFAULT_MOVE_FIELDS, found_move);
                var cleansed_string = field_strings.replace(new RegExp(/\*/, 'g'),'x');
                resolve(`${name} [${move}] -\n${cleansed_string}`);
            }
        })
        .catch(err => reject(err));
    })
}

DUSTLOOP.prototype.collect_fields = function (field_array, data){
    return field_array.filter(field => {return data[field]}).map(field => {
        return `${field}: ${data[field]}`
        }).join('\n')
}

DUSTLOOP.prototype.move_with_matching_name = function(parsed_data, move_id){
    const table_names = this.TABLE_NAMES.slice(1,5);
    const id_lc = move_id.toLowerCase();

    for(var table of table_names){
        for(var move of parsed_data[table]){
            for(var field_name of this.MOVE_ID_FIELDS){
                if (move[field_name]
                    && move[field_name].toLowerCase() === id_lc){
                        return move;
                    } 
            }
        }
    }

    return null;
}

DUSTLOOP.prototype.get_raw = function(character) {
    return new Promise((resolve, reject) => {
        var request_options = 
        {
            hostname: host,
            path: char_path(character),
            method: `GET`
        }

        var request = https.request(request_options, (res) => {
            var decoder = new StringDecoder('utf8')
            var buffer = ''

            res.on('error', (err) => {
                reject(err)
            })
            res.on('data', (data) => {
                buffer += decoder.write(data)
            })
            res.on('end', () => {
                buffer += decoder.end()
                resolve(buffer)
            })
        })

        request.end()
    })
}

DUSTLOOP.prototype.parse_response = function(raw){

    const root = parser.parse(raw);
    const tables = root.querySelectorAll('table');
    const parsed_data = {}

    //System Data table
    const system_headers = this.get_table_headers(tables[0].querySelector('thead'));
    const system_row = this.get_table_rows(tables[0].querySelector('tbody'))[0];
    parsed_data.system = this.merge_headers_and_row(system_headers, system_row);

    //Normal, Special, Super tables
    for(var i = 1; i < 5; i++){
        const headers = this.get_table_headers(tables[i].querySelector('thead'));
        const rows = this.get_table_rows(tables[i].querySelector('tbody'));

        parsed_data[this.TABLE_NAMES[i]] = rows.map( row => {
            return this.merge_headers_and_row(headers, row);
        })
    }

    return parsed_data;
}

DUSTLOOP.prototype.get_table_headers = function(table_head) {
    return table_head.querySelectorAll('th')
        .map(item => {return item.text;});
}

DUSTLOOP.prototype.get_table_rows = (table_body) => {
    return table_body.querySelectorAll('tr').map(row => {
        return row.querySelectorAll('td')
            .map( item => {
                return item.rawText;
            })
    })

}

DUSTLOOP.prototype.merge_headers_and_row = function(headers, row){
    if(headers.length != row.length){
        throw new RangeError(`header and row length mismatch while deserializing a table`)
    }

    let accum = {}
    headers.map((header, index) => {
        accum[header.toLowerCase()] = row[index];
    })
    for(var [key] of Object.entries(accum)){
        if(!key){
            delete accum[key];
        }
    }

    return accum;
}

module.exports = DUSTLOOP;