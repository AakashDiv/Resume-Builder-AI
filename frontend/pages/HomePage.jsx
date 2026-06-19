import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { HOMEPAGE_TEMPLATES, DEFAULT_HOMEPAGE_TEMPLATE } from "../data/homepageTemplates.js";
import HomePage1 from "./HomePage1.jsx";
import HomePage2 from "./HomePage2.jsx";
import HomePage3 from "./HomePage3.jsx";
import HomePage4 from "./HomePage4.jsx";

const components = {
  "homepage-1": HomePage1,
  "homepage-2": HomePage2,
  "homepage-3": HomePage3,
  "homepage-4": HomePage4
};

function isValidTemplate(value) {
  return HOMEPAGE_TEMPLATES.some((template) => template.id === value);
}

export default function HomePage() {
  const [searchParams] = useSearchParams();

  const selectedTemplate = useMemo(() => {
    const queryTemplate = searchParams.get("homepage");
    if (isValidTemplate(queryTemplate)) return queryTemplate;

    const storedTemplate = localStorage.getItem("selected_homepage_template");
    if (isValidTemplate(storedTemplate)) return storedTemplate;

    return DEFAULT_HOMEPAGE_TEMPLATE;
  }, [searchParams]);

  useEffect(() => {
    localStorage.setItem("selected_homepage_template", selectedTemplate);
  }, [selectedTemplate]);

  const SelectedHomePage = components[selectedTemplate] || components[DEFAULT_HOMEPAGE_TEMPLATE];
  return <SelectedHomePage />;
}
