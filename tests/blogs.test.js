const { TimeSeriesBucketTimestamp } = require('redis');
const Page = require('./helpers/page');

let page;
beforeEach(async () => {
    page = await Page.build();
    await page.goto("http://localhost:3000");
});

afterEach(async () => {
    await page.close();
});

describe('When logged in ', () => {
    beforeEach(async () => {
        await page.login();  // our login takes us to http://localhost:3000/blogs
        await page.click('#root > div > div > div > div.fixed-action-btn > a'); // clicking + button to create blog
    });

    test('Can see blog create from', async () => {
        await page.waitForSelector('#root > div > div > div > div > form'); 
        expect(await page.getContentsOf('form')).toBeTruthy();
    });

    describe('And using valid inputs', () => {
        const blogTitle = 'My Blog Title';
        const blogContent = 'The Blog Post Content Goes Here';
        beforeEach(async () => {
            // we will write the text into fields
            await page.type('#root > div > div > div > div > form > div.title > input', blogTitle);
            await page.type('#root > div > div > div > div > form > div.content > input', blogContent);
            await page.click('#root > div > div > div > div > form > button');
        });

        test ('Submitting takes to the review page', async () => {
            // await page.waitForSelector('h5');         no need for this 
            const text = await page.getContentsOf('h5');
            expect(text).toBe('Please confirm your entries');
        });

        test('Submitting then saving adds blog to the blog page', async () => {
            // click to save blog, redirect will happen
            await page.click('#root > div > div > div > form > div:nth-child(4) > button.green.btn-flat.right.white-text');
            await page.waitForSelector('.card');
            // first blog will be the recently added one ( first one i.e. nth-child(1))
            // assert both title and content are correct
            const titleText = await page.getContentsOf('.card-title');
            const contentText = await page.getContentsOf('p');

            expect(titleText).toBe(blogTitle);
            expect(contentText).toBe(blogContent);

        });
    });

    describe('And using invalid inputs', () => {
        beforeEach(async () => {
            await page.click('#root > div > div > div > div > form > button')
        });

        test('The form shows error message', async () => {
            const titleError = await page.getContentsOf('#root > div > div > div > div > form > div.title > div');
            const contentError = await page.getContentsOf('#root > div > div > div > div > form > div.content > div');

            expect(titleError).toBe('You must provide a value');
            expect(contentError).toBe('You must provide a value');
        });
    })
});


describe('User is not logged in', () => {

    const actions = [
        {
            method: 'get', 
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'T',
                content: 'C'
            }
        }
    ]

    test('Blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions);

        for (result of results) {
            expect(result.error).toBe('You must log in!')
        }
    });
});