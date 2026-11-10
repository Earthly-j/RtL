;; ------------------------------------------------------------------
;; RTL typing mode — "insert at start of line" approach
;; No RLO, no swap on IME commit.
;; ------------------------------------------------------------------

(define-minor-mode my-rtl-typing-mode
  "Type as if right-to-left.
After each insertion (ASCII char or IME chunk commit), point moves
to the start of the line, so the NEXT insertion appears at the
LEFT of the previous text. No RLO is used, so IME composition
appears at the same position as the committed text — no 'swap'.
The file stores chunks in reverse typing order; each chunk itself
is in natural character order."
  :lighter " RTL"
  (if my-rtl-typing-mode
      (progn
        (add-hook 'pre-command-hook  #'my-rtl-pre-command  nil t)
        (add-hook 'post-command-hook #'my-rtl-post-command nil t)
        (beginning-of-line))                       ; start clean
    (remove-hook 'pre-command-hook  #'my-rtl-pre-command  t)
    (remove-hook 'post-command-hook #'my-rtl-post-command t)
    (kill-local-variable 'my-rtl-prev-size)))

(defvar-local my-rtl-prev-size nil)

(defun my-rtl-pre-command ()
  "Remember buffer size before each command."
  (setq my-rtl-prev-size (buffer-size)))

(defun my-rtl-post-command ()
  "If a real insertion happened (and not RET/TAB/yank), move point
to the start of the line so the next insertion appears at the LEFT."
  (let ((prev-sz  my-rtl-prev-size)
        (inserted (- (buffer-size) (or my-rtl-prev-size 0))))
    (when (and my-rtl-typing-mode
               prev-sz
               (> inserted 0)
               (not (memq last-command-event '(?\n ?\r ?\t)))         ; leave RET/TAB alone
               (not (memq this-command '(yank yank-pop)))            ; leave paste alone
               (not (eq this-command 'quoted-insert)))               ; leave C-q alone
      (beginning-of-line))))

