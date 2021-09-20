const test = require('ava')
const DUSTLOOP = require('./dustloop')
const dustloop = new DUSTLOOP();

test(`Getting name from alias map`,  t => {
    const actual_nago =  dustloop.get_complete_character_name('nago');
    const actual_jack = dustloop.get_complete_character_name('jacko');
    t.is(actual_nago, 'Nagoriyuki');
    t.is(actual_jack, 'Jack-O');
})

test(`Get system data`, async t => {
    const name = dustloop.get_system_data('Faust', 'name').then(
        result => {t.is(result, `Faust -\nname: Faust`);}
    );
    const defense = dustloop.get_system_data('pot', 'defense').then(
        result => {t.is(result, `Potemkin -\ndefense: 0.93`)}
    );

    return Promise.all([name, defense])
})

test(`Get move data`, async t => {
    const damage = dustloop.get_move_data('ram', 'f.s', 'startup').then(
        result => {t.is(result, `Ramlethal_Valentine [f.s] -\nstartup: 11`)}
    )

    const rtl = dustloop.get_move_data('ky', '632146H').then(
        result => {t.is(result, 
`Ky_Kiske [632146H] -
name: Ride the Lightning
input: 632146H
guard: All
damage: 21*4, 50 [22*4, 60]
startup: 7+1
active: 3*4(20)2
recovery: 99
onblock: -82`)}
    )

    return Promise.all([damage, rtl])
})