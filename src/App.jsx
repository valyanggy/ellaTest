import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_ABOUT_ANIMATION } from "./about/aboutAnimation";
import { AboutCenter } from "./about/AboutCenter";
import { AboutPanel } from "./about/AboutPanel";
import { EmptyFilterState } from "./components/EmptyFilterState";
import { GalleryView } from "./components/GalleryView";
import { RadiusControl } from "./components/RadiusControl";
import { TopNav } from "./components/TopNav";
import { ViewSwitcher } from "./components/ViewSwitcher";
import { projectMatchesCategory } from "./content/filtering";
import { loadProjects } from "./content/projects";
import { BouquetView } from "./graph/BouquetView";

export function App() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);
  const [view, setView] = useState("bouquet");
  const [radius, setRadius] = useState(20);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutAnimation, setAboutAnimation] = useState(DEFAULT_ABOUT_ANIMATION);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selected, setSelected] = useState({ projectId: null, imageIndex: null });
  const aboutReturnViewRef = useRef("bouquet");

  useEffect(() => {
    let alive = true;

    loadProjects().then((loadedProjects) => {
      if (alive) {
        setProjects(loadedProjects);
        setLoading(false);
      }
    });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return undefined;
    }

    const introTimer = window.setTimeout(() => {
      setIntroComplete(true);
    }, 1800);

    return () => {
      window.clearTimeout(introTimer);
    };
  }, [loading]);

  const filteredProjects = useMemo(
    () => (activeCategory ? projects.filter((project) => projectMatchesCategory(project, activeCategory)) : projects),
    [activeCategory, projects]
  );

  const selectedProjectIndex = selected.projectId !== null ? projects.findIndex((project) => project.id === selected.projectId) : -1;
  const selectedProject = selectedProjectIndex >= 0 ? projects[selectedProjectIndex] : null;
  const selectedImage = selectedProject && selected.imageIndex !== null
    ? {
        projectId: selected.projectId,
        projectIndex: selectedProjectIndex,
        imageIndex: selected.imageIndex,
        project: selectedProject,
        image: selectedProject.media[selected.imageIndex]
      }
    : null;
  const isImageOpen = Boolean(selectedImage?.image);

  useEffect(() => {
    if (!isImageOpen) {
      return undefined;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isImageOpen]);

  const handleCategory = (category) => {
    setActiveCategory((currentCategory) => (currentCategory === category ? null : category));
    setAboutOpen(false);
    setSelected({ projectId: null, imageIndex: null });
  };

  const handleSelect = useCallback((projectIndex, imageIndex) => {
    setAboutOpen(false);

    if (projectIndex === null || imageIndex === null) {
      setSelected({ projectId: null, imageIndex: null });
      return;
    }

    const project = filteredProjects[projectIndex];
    setSelected({ projectId: project?.id || null, imageIndex });

    if (projectIndex !== null && imageIndex !== null) {
      setView("gallery");
    }
  }, [filteredProjects]);

  const handleBouquetSelect = useCallback((projectIndex, imageIndex) => {
    setAboutOpen(false);

    if (projectIndex === null || imageIndex === null) {
      setSelected({ projectId: null, imageIndex: null });
      return;
    }

    const project = projects[projectIndex];
    setSelected({ projectId: project?.id || null, imageIndex });

    if (projectIndex !== null && imageIndex !== null) {
      setView("gallery");
    }
  }, [projects]);

  const handleSelectProject = useCallback((projectId, imageIndex) => {
    setAboutOpen(false);
    setSelected({ projectId, imageIndex });
    setView("gallery");
  }, []);

  const handleAboutToggle = () => {
    setAboutOpen((currentOpen) => {
      const nextOpen = !currentOpen;

      if (nextOpen) {
        aboutReturnViewRef.current = view;
        setView("bouquet");
        setSelected({ projectId: null, imageIndex: null });
      } else {
        setView(aboutReturnViewRef.current);
      }

      return nextOpen;
    });
  };

  const handleAboutDismiss = useCallback(() => {
    setAboutOpen(false);
    setView(aboutReturnViewRef.current);
  }, []);

  const handleViewChange = (nextView) => {
    setSelected({ projectId: null, imageIndex: null });

    if (nextView === view) {
      return;
    }

    setView(nextView);

    if (nextView !== "bouquet") {
      setAboutOpen(false);
      aboutReturnViewRef.current = nextView;
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {!introComplete ? (
        <section className="loader-screen fixed inset-0 z-[100] grid place-content-center gap-2 bg-white text-center">
          <span className="text-xs">Welcome to</span>
          <strong className="font-junicode text-[32px] font-normal">Ella Varr Burgess</strong>
        </section>
      ) : (
        <div className="app-shell-fade">
          <AboutPanel aboutOpen={aboutOpen} onToggle={handleAboutToggle} />
          {!isImageOpen && <TopNav activeCategory={activeCategory} disabled={aboutOpen} onCategory={handleCategory} />}
          <AboutCenter aboutAnimation={aboutAnimation} aboutOpen={aboutOpen && view === "bouquet"} />
          <div className="view-transition-plane">
            <div className="view-content-transition" key={view === "bouquet" ? "bouquet" : `${view}-${activeCategory || "all"}`}>
              {view === "bouquet" ? (
                <BouquetView
                  activeCategory={activeCategory}
                  projects={projects}
                  radius={radius}
                  aboutAnimation={aboutAnimation}
                  aboutOpen={aboutOpen}
                  onDismissAbout={handleAboutDismiss}
                  onSelect={handleBouquetSelect}
                />
              ) : filteredProjects.length === 0 ? (
                <EmptyFilterState activeCategory={activeCategory} />
              ) : (
                <GalleryView
                  activeCategory={activeCategory}
                  allProjects={projects}
                  projects={filteredProjects}
                  selected={selectedImage?.image ? selectedImage : null}
                  onSelect={handleSelect}
                  onSelectProject={handleSelectProject}
                />
              )}
            </div>
          </div>
          <ViewSwitcher disabled={aboutOpen} view={isImageOpen ? null : view} setView={handleViewChange} />
          {!isImageOpen && <RadiusControl disabled={aboutOpen} radius={radius} setRadius={setRadius} view={view} />}
        </div>
      )}
    </main>
  );
}
