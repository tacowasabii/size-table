/** @returns {Promise<import('jest').Config>} */
module.exports = async () => {
    return {
        testEnvironment: 'jsdom',
    };
};