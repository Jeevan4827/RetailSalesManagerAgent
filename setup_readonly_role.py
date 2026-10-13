import psycopg

def setup_role():
    conn = psycopg.connect(
        "host=aws-0-ap-northeast-2.pooler.supabase.com port=5432 dbname=postgres user=postgres.ihcdxzkykufclqxmcewr password=Jeevan@261122 sslmode=require"
    )
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute("SELECT rolname FROM pg_roles WHERE rolname = 'retail_readonly';")
    exists = cur.fetchone()
    if not exists:
        cur.execute("CREATE ROLE retail_readonly WITH LOGIN PASSWORD 'RetailSafeReadPass2026!';")
        print("Created retail_readonly role.")
    else:
        cur.execute("ALTER ROLE retail_readonly WITH PASSWORD 'RetailSafeReadPass2026!';")
        print("Updated retail_readonly role password.")

    # Grant read permissions only on public and retail_inventory
    cur.execute("GRANT USAGE ON SCHEMA public TO retail_readonly;")
    cur.execute("REVOKE ALL ON ALL TABLES IN SCHEMA public FROM retail_readonly;")
    cur.execute("GRANT SELECT ON TABLE public.retail_inventory TO retail_readonly;")
    print("Granted least-privilege SELECT permissions on public.retail_inventory to retail_readonly!")
    conn.close()

if __name__ == "__main__":
    setup_role()
