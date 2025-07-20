import inquirer from 'inquirer';
import { PrismaClient, ProcessedLink, LinkedInPost, PostLink } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Welcome to the database dashboard!');

    while (true) {
        const { table } = await inquirer.prompt([
            {
                type: 'list',
                name: 'table',
                message: 'Which table would you like to manage?',
                choices: ['ProcessedLink', 'LinkedInPost', 'PostLink', 'Exit'],
            },
        ]);

        if (table === 'Exit') {
            break;
        }

        await manageTable(table);
    }
}

async function manageTable(table: string) {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: `What would you like to do with the ${table} table?`,
            choices: ['Display Records', 'Delete Record', 'Delete All Records', 'Get Statistics', 'Back'],
        },
    ]);

    if (action === 'Back') {
        return;
    }

    switch (action) {
        case 'Display Records':
            await displayRecords(table);
            break;
        case 'Delete Record':
            await deleteRecord(table);
            break;
        case 'Delete All Records':
            await deleteAllRecords(table);
            break;
        case 'Get Statistics':
            await getStatistics(table);
            break;
    }
}

async function deleteAllRecords(table: string) {
    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: `Are you sure you want to delete all records from the ${table} table? This action cannot be undone.`,
            default: false,
        },
    ]);

    if (confirm) {
        switch (table) {
            case 'ProcessedLink':
                await prisma.processedLink.deleteMany();
                break;
            case 'LinkedInPost':
                await prisma.linkedInPost.deleteMany();
                break;
            case 'PostLink':
                await prisma.postLink.deleteMany();
                break;
        }
        console.log(`\nAll records have been deleted from ${table}.`);
    } else {
        console.log('\nDelete all operation cancelled.');
    }
}

async function getStatistics(table: string) {
    let count;
    switch (table) {
        case 'ProcessedLink':
            count = await prisma.processedLink.count();
            break;
        case 'LinkedInPost':
            count = await prisma.linkedInPost.count();
            break;
        case 'PostLink':
            count = await prisma.postLink.count();
            break;
    }

    console.log(`\nThere are a total of ${count} records in the ${table} table.`);
}

type TableRecord = ProcessedLink | LinkedInPost | PostLink;

async function deleteRecord(table: string) {
    let records: TableRecord[] | undefined;
    switch (table) {
        case 'ProcessedLink':
            records = await prisma.processedLink.findMany();
            break;
        case 'LinkedInPost':
            records = await prisma.linkedInPost.findMany();
            break;
        case 'PostLink':
            records = await prisma.postLink.findMany();
            break;
    }

    if (!records || records.length === 0) {
        console.log(`\nNo records to delete in ${table}.`);
        return;
    }

    const { recordToDelete } = await inquirer.prompt([
        {
            type: 'list',
            name: 'recordToDelete',
            message: `Which record would you like to delete from the ${table} table?`,
            choices: records.map((record: TableRecord) => ({
                name: `${Object.values(record).join(' - ')}`,
                value: record.id,
            })),
        },
    ]);

    switch (table) {
        case 'ProcessedLink':
            await prisma.processedLink.delete({ where: { id: recordToDelete } });
            break;
        case 'LinkedInPost':
            await prisma.linkedInPost.delete({ where: { id: recordToDelete } });
            break;
        case 'PostLink':
            await prisma.postLink.delete({ where: { id: recordToDelete } });
            break;
    }

    console.log(`\nRecord with id ${recordToDelete} has been deleted from ${table}.`);
}

async function displayRecords(table: string) {
    let records;
    switch (table) {
        case 'ProcessedLink':
            records = await prisma.processedLink.findMany();
            break;
        case 'LinkedInPost':
            records = await prisma.linkedInPost.findMany();
            break;
        case 'PostLink':
            records = await prisma.postLink.findMany();
            break;
    }

    console.log(`\nRecords in ${table}:`);
    console.table(records);
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 