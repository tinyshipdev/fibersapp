import React from 'react';

const keyCommands = [
  { title: 'Enter', keys: [{ value: 'Enter'}]},
  { title: 'Indent Left', keys: [{ value: 'Shift'}, { value: 'Tab'}]},
  { title: 'Indent Right', keys: [{ value: 'Tab'}]},
  { title: 'Commands (available when editing)', keys: [{ value: '/'}]},
]

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {

  if(!isOpen) {
    return null;
  }

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">Keyboard Shortcuts</h3>

                  <div className="mt-2 w-full">

                    { keyCommands?.map((key) => (
                      <div className={'flex justify-between border-b py-4'} key={key.title}>
                        <div>{key.title}</div>
                        <div className={'flex'}>
                          {key.keys?.map((k, index) => (
                            <div key={k.value}><span className={'bg-slate-200 border px-2 font-mono text-sm inline-block'}>{k.value}</span>{ index !== key.keys.length - 1 && (<span className={'mx-2'}>+</span>) }</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => onClose()}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;