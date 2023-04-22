"use client";

import Auth from "@/supabase/auth/container";
import { useAuth, VIEWS } from "@/supabase/auth/provider";
import { LoadingDots } from "@/components/LoadingDots";
import { DashLayout } from "@/components/Layout";
import { UserAvatar } from "@/components/UserAvatar";
import { CheckIcon, ChevronDownIcon, ZapIcon } from "@primer/octicons-react";
import { Fragment, useRef, useState } from "react";
import { Dialog, Listbox, Transition } from "@headlessui/react";
import { Field, Form, Formik } from "formik";
import supabase from "@/supabase/browser";
import { toast } from "react-hot-toast";
import { toastStyle } from "@/tools/toast-style";
import {
  langs,
  packageManagers,
  platforms,
  visibilityOptions,
} from "@/tools/new/project-options";
import clsx from "clsx";
import * as Yup from "yup";
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { fetcher } from "@/tools/fetch";
import { Button } from "@/components/Button";
import { capitalizeFirstLetter } from "@/tools/text";

export const revalidate = 0;

const queryClient = new QueryClient();

const AddNewProjectSchema = Yup.object().shape({
  name: Yup.string().min(3),
});

const Home = ({ user }: any) => {
  const [open, setOpen] = useState(false);

  const platformRef: any = useRef();
  const langRef: any = useRef();
  const packageManagerRef: any = useRef();
  const visibilityRef: any = useRef();
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = async () => {
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .order("created_at");

    return projects;
  };

  const { data: projects, isLoading: projectIsLoading } = useQuery(
    ["project"],
    fetchProjects,
    {
      refetchInterval: 1,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchIntervalInBackground: true,
    }
  );

  const [visibilitySelected, setvisibilitySelected]: any = useState(
    visibilityOptions[0]
  );

  const [platformSelected, setPlatformSelected]: any = useState(platforms[0]);

  const [langSelected, setLangSelected] = useState(
    langs(platformSelected.name)[0]
  );

  const [pmSelected, setPMSelected] = useState(
    packageManagers(langSelected.name)[0]
  );

  async function addNewProject(formData: any) {
    try {
      setIsLoading(true);

      const body = {
        name: formData.name,
        visibility: visibilityRef.current.value,
        platform: platformRef.current.value,
        lang: langRef.current.value,
        package_manager: packageManagerRef.current.value,
      };

      const newBot = await fetcher("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (newBot.message === "Success") {
        toast.success(
          "You have successfully created a new bot project",
          toastStyle
        );

        setOpen(false);
      } else {
        toast.error(newBot.error, toastStyle);

        setOpen(false);
      }
    } catch (e: any) {
      toast.error(e.message, toastStyle);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <DashLayout name={user.user_metadata["name"]} href="Projects">
      <div className="flex-1 flex-grow overflow-auto">
        <div className="py-4 px-5">
          <div className="my-2">
            <div className="flex">
              <h3 className="text-xl text-white">Welcome to Botway</h3>
            </div>
          </div>
          <div className="my-8 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 gap-4">
                <div className="flex-1 gap-2 justify-end flex-shrink-0">
                  <a className="h-9 mt-1 px-4.5 inline-flex flex-shrink-0 whitespace-nowrap items-center gap-2">
                    <UserAvatar data={user.email} size={30} />
                    <span className="text-gray-400 text-2xl pl-2">
                      {user.user_metadata["name"]}
                    </span>
                  </a>
                </div>
                <div className="flex gap-2 justify-end flex-shrink-0">
                  <button
                    onClick={() => setOpen(true)}
                    className="h-9 px-2 py-3.5 rounded-lg border border-gray-800 inline-flex flex-shrink-0 whitespace-nowrap items-center gap-2 transition-colors duration-200 ease-in-out leading-none cursor-pointer text-white hover:bg-secondary focus:outline-none outline-none"
                  >
                    <ZapIcon size={16} className="fill-blue-700" />
                    New Project
                  </button>
                </div>
              </div>

              {projectIsLoading ? (
                <LoadingDots className="fixed inset-0 flex items-center justify-center" />
              ) : projects?.length != 0 ? (
                <div className="mt-10 grid lg:grid-cols-3 sm:grid-cols-2 lt-md:!grid-cols-1 gap-3">
                  {projects?.map((project) => (
                    <div className="col-span-1">
                      <a href={`/project/${project.id}`}>
                        <div className="group relative text-left border-2 border-dashed border-gray-800 rounded-xl py-4 px-6 flex flex-row transition ease-in-out duration-150 h-32 cursor-pointer hover:bg-secondary">
                          <div className="flex h-full w-full flex-col space-y-2">
                            <h5 className="text-white">
                              <div className="flex w-full flex-row justify-between gap-1">
                                <span className="flex-shrink truncate">
                                  {project.name}
                                </span>
                              </div>
                            </h5>
                            <br />
                            <div className="w-full">
                              <p className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                                <img
                                  src={`https://cdn-botway.deno.dev/icons/${project.platform}.svg`}
                                  alt={`${project.platform} icon`}
                                  width={16}
                                />
                                {capitalizeFirstLetter(project.platform)}

                                <img
                                  src={`https://cdn-botway.deno.dev/icons/${project.lang}.svg`}
                                  alt={`${project.lang} icon`}
                                  width={16}
                                />
                                {capitalizeFirstLetter(project.lang)}
                              </p>
                            </div>
                          </div>
                          <div className="absolute right-4 top-4 text-gray-500 transition-all duration-200 group-hover:right-3">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="21"
                              height="21"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="sbui-icon"
                            >
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg mt-8 overflow-hidden p-5 cursor-pointer border-2 border-dashed border-gray-800 hover:border-gray-600 shadow-lg transition duration-300 ease-in-out w-full h-60 flex flex-col items-center justify-center gap-4">
                  <h2 className="text-md text-gray-400 text-center">
                    Create a New Project
                  </h2>
                  <button
                    onClick={() => setOpen(true)}
                    className="h-9 px-2 py-3.5 rounded-lg border border-gray-800 inline-flex flex-shrink-0 whitespace-nowrap items-center gap-2 transition-colors duration-200 ease-in-out leading-none cursor-pointer text-white hover:bg-secondary focus:outline-none outline-none"
                  >
                    <ZapIcon size={16} className="fill-blue-700" />
                    New Project
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-bwdefualt bg-opacity-50 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-200"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-500"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4"></div>
                    </Transition.Child>
                    <div className="flex h-full flex-col overflow-y-scroll bg-secondary border-l border-gray-800 py-4 shadow-xl">
                      <div className="px-4 border-b border-gray-800 sm:px-6">
                        <Dialog.Title className="text-lg font-semibold text-white leading-6 pb-4">
                          Create a new Bot Project
                        </Dialog.Title>
                      </div>
                      <div className="relative mt-4 flex-1 px-4 sm:px-6">
                        <div className="my-4 max-w-4xl space-y-8">
                          <Formik
                            initialValues={{
                              name: "",
                            }}
                            validationSchema={AddNewProjectSchema}
                            onSubmit={addNewProject}
                          >
                            {({ errors }) => (
                              <>
                                <Form className="column w-full">
                                  <div>
                                    <label className="text-white col-span-12 text-base lg:col-span-5">
                                      Bot Name
                                    </label>

                                    <div className="pt-2" />

                                    <Field
                                      className="input"
                                      id="name"
                                      name="name"
                                      type="text"
                                    />

                                    {errors.name ? (
                                      <div className="text-red-600 text-sm font-semibold pt-2">
                                        {errors.name}
                                      </div>
                                    ) : null}
                                  </div>
                                  <br />
                                  <div>
                                    <label className="text-white col-span-12 text-base lg:col-span-5">
                                      Platform
                                    </label>

                                    <div className="pt-2" />

                                    <Listbox
                                      value={platformSelected}
                                      onChange={setPlatformSelected}
                                      name="platform"
                                    >
                                      {({ open }) => (
                                        <>
                                          <div className="relative">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-800 bg-bwdefualt py-2 pl-3 pr-10 text-left shadow-sm outline-none sm:text-sm">
                                              <span className="flex items-center">
                                                <img
                                                  src={`https://cdn-botway.deno.dev/icons/${platformSelected.slug}.svg`}
                                                  alt={`${platformSelected.slug} icon`}
                                                  className="h-6 w-6 flex-shrink-0"
                                                />
                                                <span className="ml-3 block text-white truncate">
                                                  {platformSelected.name}
                                                </span>
                                              </span>
                                              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                                <ChevronDownIcon
                                                  className="h-5 w-5 text-gray-400"
                                                  aria-hidden="true"
                                                />
                                              </span>
                                            </Listbox.Button>

                                            <Transition
                                              show={open}
                                              as={Fragment}
                                              leave="transition ease-in duration-100"
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg bg py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {platforms.map((platform) => (
                                                  <Listbox.Option
                                                    key={platform.name}
                                                    onChange={() =>
                                                      setPlatformSelected(
                                                        platform
                                                      )
                                                    }
                                                    className={({ active }) =>
                                                      clsx(
                                                        active
                                                          ? "text-white bg-secondary"
                                                          : "text-gray-500",
                                                        "relative transition cursor-pointer select-none py-2 pl-3 pr-9 rounded-lg mx-2 my-1"
                                                      )
                                                    }
                                                    value={platform}
                                                  >
                                                    {({ selected, active }) => (
                                                      <>
                                                        <div className="flex items-center">
                                                          <img
                                                            src={`https://cdn-botway.deno.dev/icons/${platform.slug}.svg`}
                                                            alt={`${platform.slug} icon`}
                                                            className="h-6 w-6 flex-shrink-0"
                                                            width={16}
                                                          />
                                                          <span
                                                            className={clsx(
                                                              selected
                                                                ? "font-semibold"
                                                                : "font-normal",
                                                              "ml-3 block truncate"
                                                            )}
                                                          >
                                                            {platform.name}
                                                          </span>
                                                        </div>

                                                        {selected ? (
                                                          <span
                                                            className={clsx(
                                                              active
                                                                ? "text-white"
                                                                : "text-blue-700",
                                                              "absolute inset-y-0 right-0 flex items-center pr-4"
                                                            )}
                                                          >
                                                            <CheckIcon
                                                              className="h-5 w-5"
                                                              aria-hidden="true"
                                                            />
                                                          </span>
                                                        ) : null}
                                                      </>
                                                    )}
                                                  </Listbox.Option>
                                                ))}
                                              </Listbox.Options>
                                            </Transition>
                                          </div>
                                        </>
                                      )}
                                    </Listbox>

                                    <input
                                      type="hidden"
                                      name="platform[name]"
                                      value={platformSelected.slug}
                                      ref={platformRef}
                                    />
                                  </div>
                                  <br />
                                  <div>
                                    <label className="text-white col-span-12 text-base lg:col-span-5">
                                      Programming Language
                                    </label>

                                    <div className="pt-2" />

                                    <Listbox
                                      value={langSelected}
                                      onChange={setLangSelected}
                                    >
                                      {({ open }) => (
                                        <>
                                          <div className="relative">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-800 bg-bwdefualt py-2 pl-3 pr-10 text-left shadow-sm outline-none sm:text-sm">
                                              <span className="flex items-center">
                                                <img
                                                  src={`https://cdn-botway.deno.dev/icons/${langSelected.slug}.svg`}
                                                  alt={`${langSelected.slug} icon`}
                                                  className="h-6 w-6 flex-shrink-0"
                                                />
                                                <span className="ml-3 block text-white truncate">
                                                  {langSelected.name}
                                                </span>
                                              </span>
                                              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                                <ChevronDownIcon
                                                  className="h-5 w-5 text-gray-400"
                                                  aria-hidden="true"
                                                />
                                              </span>
                                            </Listbox.Button>

                                            <Transition
                                              show={open}
                                              as={Fragment}
                                              leave="transition ease-in duration-100"
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg bg py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {langs(
                                                  platformSelected.name
                                                ).map((lang) => (
                                                  <Listbox.Option
                                                    key={lang.name}
                                                    className={({ active }) =>
                                                      clsx(
                                                        active
                                                          ? "text-white bg-secondary"
                                                          : "text-gray-500",
                                                        "relative transition cursor-pointer select-none py-2 pl-3 pr-9 rounded-lg mx-2 my-1"
                                                      )
                                                    }
                                                    value={lang}
                                                  >
                                                    {({ selected, active }) => (
                                                      <>
                                                        <div className="flex items-center">
                                                          <img
                                                            src={`https://cdn-botway.deno.dev/icons/${lang.slug}.svg`}
                                                            alt={`${lang.slug} icon`}
                                                            className="h-6 w-6 flex-shrink-0"
                                                            width={16}
                                                          />
                                                          <span
                                                            className={clsx(
                                                              selected
                                                                ? "font-semibold"
                                                                : "font-normal",
                                                              "ml-3 block truncate"
                                                            )}
                                                          >
                                                            {lang.name}
                                                          </span>
                                                        </div>

                                                        {selected ? (
                                                          <span
                                                            className={clsx(
                                                              active
                                                                ? "text-white"
                                                                : "text-blue-700",
                                                              "absolute inset-y-0 right-0 flex items-center pr-4"
                                                            )}
                                                          >
                                                            <CheckIcon
                                                              className="h-5 w-5"
                                                              aria-hidden="true"
                                                            />
                                                          </span>
                                                        ) : null}
                                                      </>
                                                    )}
                                                  </Listbox.Option>
                                                ))}
                                              </Listbox.Options>
                                            </Transition>
                                          </div>
                                        </>
                                      )}
                                    </Listbox>

                                    <input
                                      type="hidden"
                                      name="lang[name]"
                                      value={langSelected.slug}
                                      ref={langRef}
                                    />
                                  </div>
                                  <br />
                                  <div>
                                    <label className="text-white col-span-12 text-base lg:col-span-5">
                                      Package Manager
                                    </label>

                                    <div className="pt-2" />

                                    <Listbox
                                      value={pmSelected}
                                      refName={packageManagerRef}
                                      onChange={setPMSelected}
                                    >
                                      {({ open }) => (
                                        <>
                                          <div className="relative">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-800 bg-bwdefualt py-2 pl-3 pr-10 text-left shadow-sm outline-none sm:text-sm">
                                              <span className="flex items-center">
                                                <img
                                                  src={`https://cdn-botway.deno.dev/icons/${pmSelected.logo}`}
                                                  alt={`${pmSelected.logo} icon`}
                                                  className="h-6 w-6 flex-shrink-0"
                                                />
                                                <span className="ml-3 block text-white truncate">
                                                  {pmSelected.name}
                                                </span>
                                              </span>
                                              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                                <ChevronDownIcon
                                                  className="h-5 w-5 text-gray-400"
                                                  aria-hidden="true"
                                                />
                                              </span>
                                            </Listbox.Button>

                                            <Transition
                                              show={open}
                                              as={Fragment}
                                              leave="transition ease-in duration-100"
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg bg py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {packageManagers(
                                                  langSelected.name
                                                ).map((pm) => (
                                                  <Listbox.Option
                                                    key={pm.name}
                                                    className={({ active }) =>
                                                      clsx(
                                                        active
                                                          ? "text-white bg-secondary"
                                                          : "text-gray-500",
                                                        "relative transition cursor-pointer select-none py-2 pl-3 pr-9 rounded-lg mx-2 my-1"
                                                      )
                                                    }
                                                    value={pm}
                                                  >
                                                    {({ selected, active }) => (
                                                      <>
                                                        <div className="flex items-center">
                                                          <img
                                                            src={`https://cdn-botway.deno.dev/icons/${pm.logo}`}
                                                            alt={`${pm.name} icon`}
                                                            className="h-6 w-6 flex-shrink-0"
                                                            width={16}
                                                          />
                                                          <span
                                                            className={clsx(
                                                              selected
                                                                ? "font-semibold"
                                                                : "font-normal",
                                                              "ml-3 block truncate"
                                                            )}
                                                          >
                                                            {pm.name}
                                                          </span>
                                                        </div>

                                                        {selected ? (
                                                          <span
                                                            className={clsx(
                                                              active
                                                                ? "text-white"
                                                                : "text-blue-700",
                                                              "absolute inset-y-0 right-0 flex items-center pr-4"
                                                            )}
                                                          >
                                                            <CheckIcon
                                                              className="h-5 w-5"
                                                              aria-hidden="true"
                                                            />
                                                          </span>
                                                        ) : null}
                                                      </>
                                                    )}
                                                  </Listbox.Option>
                                                ))}
                                              </Listbox.Options>
                                            </Transition>
                                          </div>
                                        </>
                                      )}
                                    </Listbox>

                                    <input
                                      type="hidden"
                                      name="pm[name]"
                                      value={pmSelected.name}
                                      ref={packageManagerRef}
                                    />
                                  </div>
                                  <br />
                                  <div>
                                    <label className="text-white col-span-12 text-base lg:col-span-5">
                                      Visibility On GitHub
                                    </label>

                                    <div className="pt-2" />

                                    <Listbox
                                      value={visibilitySelected}
                                      refName={visibilityRef}
                                      onChange={setvisibilitySelected}
                                    >
                                      {({ open }) => (
                                        <>
                                          <div className="relative">
                                            <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-gray-800 bg-bwdefualt py-2 pl-3 pr-10 text-left shadow-sm outline-none sm:text-sm">
                                              <span className="flex items-center">
                                                <span className="ml-2 text-white block truncate">
                                                  {visibilitySelected.typeName}
                                                </span>
                                              </span>
                                              <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                                <ChevronDownIcon
                                                  className="h-5 w-5 text-gray-400"
                                                  aria-hidden="true"
                                                />
                                              </span>
                                            </Listbox.Button>

                                            <Transition
                                              show={open}
                                              as={Fragment}
                                              leave="transition ease-in duration-100"
                                              leaveFrom="opacity-100"
                                              leaveTo="opacity-0"
                                            >
                                              <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg bg py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {visibilityOptions.map(
                                                  (visibility) => (
                                                    <Listbox.Option
                                                      key={visibility.typeName}
                                                      className={({ active }) =>
                                                        clsx(
                                                          active
                                                            ? "text-white bg-secondary"
                                                            : "text-gray-500",
                                                          "relative transition cursor-pointer select-none py-2 pl-2 pr-9 rounded-lg mx-2 my-1"
                                                        )
                                                      }
                                                      value={visibility}
                                                    >
                                                      {({
                                                        selected,
                                                        active,
                                                      }) => (
                                                        <>
                                                          <div className="flex items-center">
                                                            <span
                                                              className={clsx(
                                                                selected
                                                                  ? "font-semibold"
                                                                  : "font-normal",
                                                                "ml-3 block truncate"
                                                              )}
                                                            >
                                                              {
                                                                visibility.typeName
                                                              }
                                                            </span>
                                                          </div>

                                                          {selected ? (
                                                            <span
                                                              className={clsx(
                                                                active
                                                                  ? "text-white"
                                                                  : "text-blue-700",
                                                                "absolute inset-y-0 right-0 flex items-center pr-4"
                                                              )}
                                                            >
                                                              <CheckIcon
                                                                className="h-5 w-5"
                                                                aria-hidden="true"
                                                              />
                                                            </span>
                                                          ) : null}
                                                        </>
                                                      )}
                                                    </Listbox.Option>
                                                  )
                                                )}
                                              </Listbox.Options>
                                            </Transition>
                                          </div>
                                        </>
                                      )}
                                    </Listbox>

                                    <input
                                      type="hidden"
                                      name="visibility[typeName]"
                                      value={visibilitySelected.type}
                                      ref={visibilityRef}
                                    />
                                  </div>

                                  <Button
                                    htmlType="submit"
                                    type="success"
                                    loading={isLoading}
                                  >
                                    Create Bot Project
                                  </Button>
                                </Form>

                                <a
                                  href="https://railway.app"
                                  target="_blank"
                                  className="mt-4 border border-gray-800 transition-all bg-[#181622] hover:bg-[#1f132a] duration-200 rounded-2xl p-4 sm:mt-8 flex flex-col items-center"
                                >
                                  <div aria-hidden="true">
                                    <img
                                      src="https://cdn-botway.deno.dev/icons/railway.svg"
                                      width={30}
                                    />
                                  </div>
                                  <div className="space-y-2 mt-3 sm:space-y-4 flex flex-col items-center">
                                    <h1 className="text-white text-xs md:text-sm font-bold">
                                      Your Bot Project will be hosted on Railway
                                    </h1>
                                    <p className="text-xs md:text-sm text-gray-400 text-center">
                                      Railway is a canvas for shipping your
                                      apps, databases, and more 🚄
                                    </p>
                                  </div>
                                </a>
                              </>
                            )}
                          </Formik>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </DashLayout>
  );
};

const App = () => {
  const { initial, user, view } = useAuth();

  if (initial) {
    return (
      <LoadingDots className="fixed inset-0 flex items-center justify-center" />
    );
  }

  if (view === VIEWS.UPDATE_PASSWORD) {
    return <Auth view={view} />;
  }

  if (user) {
    return (
      <QueryClientProvider client={queryClient}>
        <Home user={user} />
      </QueryClientProvider>
    );
  }

  return <Auth view={view} />;
};

export default App;
