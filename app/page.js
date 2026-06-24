import styles from "./page.module.css";

export default function HomePage() {
    return (
        <main className={styles.main}>
            <section className={styles.card}>
                <p className={styles.eyebrow}>CS 4720 Internet Programming</p>
                <h1 className={styles.title}>Andrew&apos;s AutoParts</h1>
                <p className={styles.copy}>Welcome to Andrew&apos;s AutoParts! We are your one-stop shop for all your automotive needs.</p>
                {/* This form posts directly to the App Router route handler in app/processorder. */}
                <form action="/processorder" method="post" className={styles.form}>
                    <table className={styles.orderTable}>
                        <thead>
                            <tr className={styles.tableHeader}>
                                <th className={styles.itemColumn}>Item</th>
                                <th className={styles.qtyColumn}>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Struts</td>
                                <td>
                                    <input type="number" name="strutsqty" min="0" max="999" step="1" className={styles.input} />
                                </td>
                            </tr>
                            <tr>
                                <td>Oil</td>
                                <td>
                                    <input type="number" name="oilqty" min="0" max="999" step="1" className={styles.input} />
                                </td>
                            </tr>
                            <tr>
                                <td>Air Filters</td>
                                <td>
                                    <input type="number" name="airfilterqty" min="0" max="999" step="1" className={styles.input} />
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2" className={styles.submitCell}>
                                    <input type="submit" value="Submit Order" className={styles.submitButton} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </section>
        </main>
    );
}
