const { createClient } = require('@supabase/supabase-js');

// Credentials provided by user in chat
const SUPABASE_URL = 'https://uotljswfbmloxvadgtuv.supabase.co';
// The key user provided - likely valid for client side but maybe not server side without RLS
const SUPABASE_KEY = 'sb_publishable_SL01O_tAhrofU8IJK0IrnQ_xOXTZdEI';

console.log('Testing Supabase Connection...');
console.log(`URL: ${SUPABASE_URL}`);
console.log(`KEY: ${SUPABASE_KEY.substring(0, 15)}...`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
    try {
        console.log('1. Testing SELECT * ...');
        const { data: selectData, error: selectError } = await supabase.from('tasks').select('*').limit(1);

        if (selectError) {
            console.error('❌ SELECT FAILED!');
            console.error(selectError);
        } else {
            console.log('✅ SELECT SUCCESSFUL!');
            console.log('Data:', selectData);
        }

        console.log('\n2. Testing INSERT ...');
        const { data: insertData, error: insertError } = await supabase
            .from('tasks')
            .insert([{ title: 'Test from CLI', status: 'todo' }])
            .select();

        if (insertError) {
            console.error('❌ INSERT FAILED!');
            console.error(insertError);

            if (insertError.code === '42501') {
                console.error('⚠️  PERMISSION DENIED (42501) - Likely RLS issue or key does not have write access.');
            }
        } else {
            console.log('✅ INSERT SUCCESSFUL!');
            console.log('Inserted:', insertData);

            // Cleanup
            if (insertData && insertData[0]) {
                await supabase.from('tasks').delete().eq('id', insertData[0].id);
                console.log('✅ Cleanup SUCCESSFUL');
            }
        }

    } catch (err) {
        console.error('❌ VALIDATION CRASHED:', err.message);
    }
}

testConnection();
