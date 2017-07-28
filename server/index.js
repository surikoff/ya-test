const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')('public'));

const Router = require('koa-router');
const router = new Router();

let count = 0;

router.post('*', async function(ctx, next) {
    console.log(count++);

    ctx.set('Content-Type', 'application/json');
    // Логика теста: первые 3 запроса отдают 'progress', четвертый - 'error', пятый - 'sussess' и далее по кругу

    if (count < 4)
        ctx.body = JSON.stringify({
            status: 'progress',
            timeout: 1000
        })
    else if (count == 4)
        ctx.body = JSON.stringify({
            status: 'error',
            reason: 'reason'
        })
    else if (count == 5) {
        ctx.body = JSON.stringify({
            status: 'success'
        });
        count = 0;
    }
})

app.use(router.routes());

app.listen(3000, () => console.log('Server listen on 3000...'));
