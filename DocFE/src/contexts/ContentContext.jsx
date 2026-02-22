import { createContext, useContext, useEffect, useState } from "react";

const ContentContext = createContext({});

export const useContent = () => useContext(ContentContext);

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/content.json")
      .then((res) => res.json())
      .then((data) => {
        setContent(data);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
};