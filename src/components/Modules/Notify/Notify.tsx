
const Notify = (message: string, color: string) => {
    const container = document.createElement('div');
    container.setAttribute('style', `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: #333;
        color: #fff;
        padding: 10px;
        text-align: center;
    `);
    container.innerText = message;
    container.style.backgroundColor = color;
    document.body.appendChild(container);

    setTimeout(() => {
        document.body.removeChild(container);
    }, 2000);
};

export default Notify;