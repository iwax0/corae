import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function BottomSheet({
  open,
  title,
  onClose,
  children,
  scrollContent = true,
  contentClassName = "",
  panelClassName = "",
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={onClose}
          />

          <motion.div
            className={`fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white shadow-2xl ${panelClassName}`}
            initial={{ y: "100%", opacity: 0.96 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.96 }}
            transition={{
              type: "spring",
              stiffness: 240,
              damping: 28,
            }}
          >
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-gray-300" />

            <div className="flex items-center justify-between px-4 pb-2 pt-4">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <motion.div
              className={`px-4 pb-6 ${
                scrollContent ? "max-h-[75vh] overflow-y-auto" : ""
              } ${contentClassName}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}