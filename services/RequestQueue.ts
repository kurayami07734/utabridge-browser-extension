type Task = () => Promise<void>;

export class RequestQueue {
    private queue: Task[] = [];
    private activeCount = 0;
    private concurrency: number;

    constructor(concurrency: number = 2) {
        this.concurrency = concurrency;
    }

    add(task: Task) {
        this.queue.push(task);
        this.process();
    }

    setConcurrency(limit: number) {
        this.concurrency = limit;
        this.process();
    }

    private process() {
        while (this.activeCount < this.concurrency && this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                this.activeCount++;
                task().finally(() => {
                    this.activeCount--;
                    this.process();
                });
            }
        }
    }
}
