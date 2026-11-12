import {createClient} from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://mock.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

function isValidSupabaseUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      !url.includes("your-project")
    );
  } catch {
    return false;
  }
}

const useRealSupabase = Boolean(
  isValidSupabaseUrl(supabaseUrl) &&
    supabaseKey &&
    !supabaseKey.includes("your-anon-key")
);

// In-memory file blob store for uploaded QRs and profile pics
const fileBlobMap = new Map();

// Helper to persist and retrieve mock data from localStorage
const STORAGE_PREFIX = "trimrr_mock_";

function getStored(key, defaultValue) {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.warn("Error saving to localStorage", err);
  }
}

// Initial mock data
const defaultUser = {
  id: "user_demo_123",
  email: "demo@trimrr.in",
  role: "authenticated",
  user_metadata: {
    name: "Demo User",
    profile_pic: "/logo.png",
  },
};

const defaultUrls = [
  {
    id: 1,
    title: "GitHub Repository",
    user_id: "user_demo_123",
    original_url: "https://github.com/Nikhil028-com/URL-SHORTNER",
    custom_url: "url-shortener-repo",
    short_url: "ghub",
    qr: "/qr.png",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 2,
    title: "AI Studio Build",
    user_id: "user_demo_123",
    original_url: "https://aistudio.google.com",
    custom_url: "google-ai",
    short_url: "aist",
    qr: "/qr.png",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const defaultClicks = [
  {
    id: 1,
    url_id: 1,
    city: "San Francisco",
    country: "United States",
    device: "desktop",
    created_at: new Date(Date.now() - 72000000).toISOString(),
  },
  {
    id: 2,
    url_id: 1,
    city: "London",
    country: "United Kingdom",
    device: "mobile",
    created_at: new Date(Date.now() - 60000000).toISOString(),
  },
  {
    id: 3,
    url_id: 1,
    city: "Tokyo",
    country: "Japan",
    device: "desktop",
    created_at: new Date(Date.now() - 48000000).toISOString(),
  },
  {
    id: 4,
    url_id: 1,
    city: "San Francisco",
    country: "United States",
    device: "mobile",
    created_at: new Date(Date.now() - 36000000).toISOString(),
  },
  {
    id: 5,
    url_id: 2,
    city: "Berlin",
    country: "Germany",
    device: "desktop",
    created_at: new Date(Date.now() - 24000000).toISOString(),
  },
  {
    id: 6,
    url_id: 2,
    city: "New York",
    country: "United States",
    device: "desktop",
    created_at: new Date(Date.now() - 12000000).toISOString(),
  },
  {
    id: 7,
    url_id: 2,
    city: "Toronto",
    country: "Canada",
    device: "mobile",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

function initMockStore() {
  if (!getStored("initialized", false)) {
    setStored("users", [defaultUser]);
    setStored("current_user", defaultUser);
    setStored("urls", defaultUrls);
    setStored("clicks", defaultClicks);
    setStored("initialized", true);
  }
}

initMockStore();

// Query Builder for mock Supabase client
class MockQueryBuilder {
  constructor(table) {
    this.table = table;
    this.data = getStored(table, []);
    this.filters = [];
    this.orFilter = null;
    this.isSingle = false;
    this.isDelete = false;
  }

  select() {
    return this;
  }

  eq(column, value) {
    this.filters.push((item) => String(item[column]) === String(value));
    return this;
  }

  in(column, values) {
    const list = Array.isArray(values) ? values.map(String) : [];
    this.filters.push((item) => list.includes(String(item[column])));
    return this;
  }

  or(conditionString) {
    // e.g. "short_url.eq.id,custom_url.eq.id"
    this.orFilter = (item) => {
      const parts = conditionString.split(",");
      return parts.some((part) => {
        const [col, op, val] = part.trim().split(".");
        if (op === "eq") {
          return String(item[col]) === String(val);
        }
        return false;
      });
    };
    return this;
  }

  single() {
    this.isSingle = true;
    return this.execute();
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  async insert(rows) {
    const tableData = getStored(this.table, []);
    const items = Array.isArray(rows) ? rows : [rows];
    const inserted = items.map((row, index) => {
      const id = Date.now() + index;
      let qrUrl = row.qr;

      // If this row has a qr with fileName that exists in fileBlobMap, attach blob URL
      if (row.qr && typeof row.qr === "string") {
        for (const [name, blobUrl] of fileBlobMap.entries()) {
          if (row.qr.includes(name)) {
            qrUrl = blobUrl;
            break;
          }
        }
      }

      return {
        id,
        created_at: new Date().toISOString(),
        ...row,
        qr: qrUrl || row.qr || "/qr.png",
      };
    });

    const updated = [...tableData, ...inserted];
    setStored(this.table, updated);

    return {
      data: inserted,
      error: null,
      select: () => ({data: inserted, error: null}),
    };
  }

  async execute() {
    let result = [...getStored(this.table, [])];

    for (const filter of this.filters) {
      result = result.filter(filter);
    }

    if (this.orFilter) {
      result = result.filter(this.orFilter);
    }

    if (this.isDelete) {
      const toDeleteIds = new Set(result.map((item) => String(item.id)));
      const original = getStored(this.table, []);
      const remaining = original.filter((item) => !toDeleteIds.has(String(item.id)));
      setStored(this.table, remaining);
      return {data: result, error: null};
    }

    if (this.isSingle) {
      if (result.length === 0) {
        return {
          data: null,
          error: {code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned"},
        };
      }
      return {data: result[0], error: null};
    }

    return {data: result, error: null};
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }
}

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithPassword: async ({email}) => {
      const users = getStored("users", [defaultUser]);
      const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        setStored("current_user", found);
        return {
          data: {
            user: found,
            session: {user: found, access_token: "mock-token"},
          },
          error: null,
        };
      }
      // If user not registered in mock, auto-create for friendly prototyping
      const newUser = {
        id: "user_" + Date.now(),
        email,
        role: "authenticated",
        user_metadata: {
          name: email.split("@")[0],
          profile_pic: "/logo.png",
        },
      };
      setStored("users", [...users, newUser]);
      setStored("current_user", newUser);
      return {
        data: {
          user: newUser,
          session: {user: newUser, access_token: "mock-token"},
        },
        error: null,
      };
    },

    signUp: async ({email, options}) => {
      const users = getStored("users", [defaultUser]);
      const name = options?.data?.name || email.split("@")[0];
      let profile_pic = options?.data?.profile_pic || "/logo.png";

      for (const [fileName, blobUrl] of fileBlobMap.entries()) {
        if (profile_pic.includes(fileName)) {
          profile_pic = blobUrl;
          break;
        }
      }

      const newUser = {
        id: "user_" + Date.now(),
        email,
        role: "authenticated",
        user_metadata: {
          name,
          profile_pic,
        },
      };
      setStored("users", [...users, newUser]);
      setStored("current_user", newUser);
      return {
        data: {
          user: newUser,
          session: {user: newUser, access_token: "mock-token"},
        },
        error: null,
      };
    },

    getSession: async () => {
      const currentUser = getStored("current_user", defaultUser);
      if (!currentUser) {
        return {data: {session: null}, error: null};
      }
      return {
        data: {
          session: {
            user: currentUser,
            access_token: "mock-token",
          },
        },
        error: null,
      };
    },

    signOut: async () => {
      setStored("current_user", null);
      return {error: null};
    },
  },

  storage: {
    from: () => ({
      upload: async (fileName, fileOrBlob) => {
        try {
          if (typeof window !== "undefined" && fileOrBlob instanceof Blob) {
            const blobUrl = URL.createObjectURL(fileOrBlob);
            fileBlobMap.set(fileName, blobUrl);
          }
          return {data: {path: fileName}, error: null};
        } catch (err) {
          return {data: null, error: err};
        }
      },
      getPublicUrl: (fileName) => {
        const blobUrl = fileBlobMap.get(fileName);
        return {
          data: {
            publicUrl: blobUrl || `/qr.png`,
          },
        };
      },
    }),
  },

  from: (table) => new MockQueryBuilder(table),
};

const supabase = useRealSupabase
  ? createClient(supabaseUrl, supabaseKey)
  : mockSupabase;

export default supabase;
